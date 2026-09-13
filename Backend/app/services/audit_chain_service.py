"""
audit_chain_service.py — Tamper-evident cryptographic audit chain logic.

Responsibilities:
  - Deterministic canonicalization of AuditLog entries
  - SHA-256 hash computation
  - Chain-aware audit event creation (with SERIALIZABLE locking on chain tail)
  - Full chain verification for a given case scope

Chain scope: case_id (UUID string) or "SYSTEM" for events without a case.
Chain genesis: first event uses previous_hash = "GENESIS".
Pre-chain records: previous_hash = "LEGACY" are skipped during verification.

Security note: all hashes are computed server-side. Client-provided hashes
are never trusted and never accepted as inputs.
"""

from __future__ import annotations

import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any, Optional
from uuid import UUID

import re

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


# ── Constants ──────────────────────────────────────────────────────────────────
GENESIS_HASH = "GENESIS"
LEGACY_HASH  = "LEGACY"
_HEX_HASH_RE = re.compile(r"^[a-f0-9]{64}$")


# ── Canonicalization ──────────────────────────────────────────────────────────

def _scope_key(case_id: Optional[UUID]) -> str:
    """Return the chain scope identifier string."""
    return str(case_id) if case_id else "SYSTEM"


def canonicalize_event(event: AuditLog) -> str:
    """
    Produce a deterministic canonical string for an AuditLog entry.

    Rules:
    - Fields selected: id, module, action, user, userRole, entityId,
      caseId, status, timestamp, details, ipAddress
    - Fields sorted by key (alphabetical)
    - None/null values represented as empty string ""
    - Timestamp is preserved as stored string (caller should store ISO-8601 UTC)
    - Serialized as compact JSON (no spaces), UTF-8
    - Output is a str ready for hashing
    """
    def _str(v: Any) -> str:
        if v is None:
            return ""
        return str(v)

    payload: dict[str, str] = {
        "action":    _str(event.action),
        "caseId":    _str(event.caseId),
        "details":   _str(event.details),
        "entityId":  _str(event.entityId),
        "id":        _str(event.id),
        "ipAddress": _str(event.ipAddress),
        "module":    _str(event.module),
        "status":    _str(event.status),
        "timestamp": _str(event.timestamp),
        "user":      _str(event.user),
        "userRole":  _str(event.userRole),
    }
    # sorted keys → deterministic output regardless of insertion order
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def compute_event_hash(canonical: str, previous_hash: str) -> str:
    """
    Compute SHA-256 over canonical_payload + "|" + previous_hash.

    Returns lowercase hex digest (64 chars).
    """
    data = (canonical + "|" + previous_hash).encode("utf-8")
    return hashlib.sha256(data).hexdigest()


# ── Concurrency / scope locking ───────────────────────────────────────────────

def _advisory_lock_key(scope_key: str) -> int:
    """Derive a stable signed int64 key for pg_advisory_xact_lock."""
    digest = hashlib.sha256(scope_key.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big", signed=True)


async def _acquire_scope_chain_lock(db: AsyncSession, scope_key: str) -> None:
    """
    Serialize chain appends within a scope for the duration of the transaction.
    Requires PostgreSQL (pg_advisory_xact_lock).
    """
    lock_key = _advisory_lock_key(scope_key)
    await db.execute(text("SELECT pg_advisory_xact_lock(:lock_key)"), {"lock_key": lock_key})


def _scope_filter(scope_key: str):
    if scope_key == "SYSTEM":
        return AuditLog.caseId.is_(None)
    return AuditLog.caseId == UUID(scope_key)


# ── Chain tail retrieval ──────────────────────────────────────────────────────

async def _get_chain_tail(db: AsyncSession, scope_key: str) -> Optional[AuditLog]:
    """
    Retrieve the most recent chained event in a scope (locked when inside a transaction).
    Excludes LEGACY entries (pre-chain records).
    """
    stmt = (
        select(AuditLog)
        .where(_scope_filter(scope_key))
        .where(AuditLog.eventHash != LEGACY_HASH)
        .where(AuditLog.previousHash != LEGACY_HASH)
        .order_by(AuditLog.createdAt.desc())
        .limit(1)
        .with_for_update()
    )
    result = await db.execute(stmt)
    return result.scalars().first()


def _is_pure_legacy(ev: AuditLog) -> bool:
    return ev.previousHash == LEGACY_HASH and ev.eventHash == LEGACY_HASH


def _is_legacy_inconsistent(ev: AuditLog) -> bool:
    prev_legacy = ev.previousHash == LEGACY_HASH
    evt_legacy = ev.eventHash == LEGACY_HASH
    return prev_legacy != evt_legacy


def _validate_chained_hash_fields(ev: AuditLog) -> Optional[str]:
    """Return failure_type if hash fields are invalid for a non-legacy row."""
    if not ev.eventHash or not ev.previousHash:
        return "MISSING_HASH"
    if ev.previousHash != GENESIS_HASH and not _HEX_HASH_RE.fullmatch(ev.previousHash):
        return "INVALID_HASH_FORMAT"
    if not _HEX_HASH_RE.fullmatch(ev.eventHash):
        return "INVALID_HASH_FORMAT"
    return None


# ── Event creation ────────────────────────────────────────────────────────────

async def create_audit_event(
    db: AsyncSession,
    *,
    module: str,
    action: str,
    user: str,
    user_role: str,
    entity_id: Optional[str] = None,
    case_id: Optional[UUID] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
    status: str = "success",
    created_by: Optional[UUID] = None,
) -> AuditLog:
    """
    Create a new AuditLog entry and attach it to the cryptographic chain.

    Steps:
    1. Determine chain scope from case_id
    2. Retrieve tail of existing chain in that scope
    3. Build the new AuditLog (without hash fields set yet)
    4. Canonicalize the event
    5. Compute event_hash = SHA-256(canonical + "|" + previous_hash)
    6. Set previous_hash and event_hash on the record
    7. Add to session (caller is responsible for commit)

    Concurrent appends in the same scope are serialized via PostgreSQL
    pg_advisory_xact_lock(scope) plus SELECT FOR UPDATE on the chain tail row.
    """
    now_iso = datetime.now(timezone.utc).isoformat()
    scope = _scope_key(case_id)

    await _acquire_scope_chain_lock(db, scope)

    # Determine previous_hash from chain tail
    tail = await _get_chain_tail(db, scope)
    previous_hash = tail.eventHash if tail else GENESIS_HASH

    # Build record (id generated now so it can be canonicalized)
    event_id = uuid.uuid4()
    event = AuditLog(
        id=event_id,
        module=module,
        action=action,
        user=user,
        userRole=user_role,
        entityId=entity_id,
        caseId=case_id,
        details=details,
        ipAddress=ip_address,
        status=status,
        timestamp=now_iso,
        createdBy=created_by,
        updatedBy=created_by,
        # placeholder — will be overwritten before adding to session
        previousHash=LEGACY_HASH,
        eventHash=LEGACY_HASH,
    )

    # Canonicalize and compute hash
    canonical = canonicalize_event(event)
    event_hash = compute_event_hash(canonical, previous_hash)

    # Set chain fields
    event.previousHash = previous_hash
    event.eventHash = event_hash

    db.add(event)
    await db.flush()
    return event


# ── Verification ──────────────────────────────────────────────────────────────

class ChainVerificationResult:
    """Structured result from verify_chain()."""

    def __init__(
        self,
        valid: bool,
        chain_length: int,
        verified_events: int,
        legacy_events: int,
        first_invalid_event_id: Optional[str],
        failure_type: Optional[str],
        message: str,
    ) -> None:
        self.valid = valid
        self.chain_length = chain_length
        self.verified_events = verified_events
        self.legacy_events = legacy_events
        self.first_invalid_event_id = first_invalid_event_id
        self.failure_type = failure_type
        self.message = message

    def to_dict(self) -> dict:
        return {
            "valid": self.valid,
            "chain_length": self.chain_length,
            "verified_events": self.verified_events,
            "legacy_events": self.legacy_events,
            "first_invalid_event_id": self.first_invalid_event_id,
            "failure_type": self.failure_type,
            "message": self.message,
        }


async def verify_chain(db: AsyncSession, scope_key: str) -> ChainVerificationResult:
    """
    Verify the cryptographic integrity of a case-scoped (or SYSTEM) audit chain.

    Algorithm:
    1. Retrieve all events in the scope, ordered by created_at ASC (chain order)
    2. Skip pure LEGACY events (both hashes LEGACY); fail on inconsistent legacy rows
    3. For each chained event:
       a. Recompute canonical payload
       b. Recompute expected_hash = SHA-256(canonical + "|" + previous_hash)
       c. Compare expected_hash with stored event_hash → HASH_MISMATCH
       d. Compare stored previous_hash with previous event's event_hash → LINKAGE_MISMATCH
    4. Return structured result

    Failure types:
    - HASH_MISMATCH: event payload was modified after creation
    - LINKAGE_MISMATCH: previous_hash does not match preceding event's hash (chain broken)
    - MISSING_HASH: event_hash or previous_hash is empty/null
    - LEGACY_INCONSISTENT: only one of the hash fields is LEGACY
    - INVALID_HASH_FORMAT: chained row has non-hex or wrong-length hash values
    """
    if scope_key == "SYSTEM":
        stmt = (
            select(AuditLog)
            .where(AuditLog.caseId.is_(None))
            .order_by(AuditLog.createdAt.asc())
        )
    else:
        try:
            UUID(scope_key)
        except ValueError:
            return ChainVerificationResult(
                valid=False,
                chain_length=0,
                verified_events=0,
                legacy_events=0,
                first_invalid_event_id=None,
                failure_type="INVALID_SCOPE",
                message="Invalid case ID format.",
            )
        stmt = (
            select(AuditLog)
            .where(_scope_filter(scope_key))
            .order_by(AuditLog.createdAt.asc())
        )

    result = await db.execute(stmt)
    all_events = result.scalars().all()

    chain_length = len(all_events)
    legacy_count = 0
    chained_events = []

    for ev in all_events:
        if _is_pure_legacy(ev):
            legacy_count += 1
            continue
        if _is_legacy_inconsistent(ev):
            return ChainVerificationResult(
                valid=False,
                chain_length=chain_length,
                verified_events=0,
                legacy_events=legacy_count,
                first_invalid_event_id=str(ev.id),
                failure_type="LEGACY_INCONSISTENT",
                message=(
                    f"Event {ev.id} has inconsistent legacy markers "
                    f"(previous_hash and event_hash must both be LEGACY or neither)."
                ),
            )
        chained_events.append(ev)

    verified = 0
    expected_previous = GENESIS_HASH

    for ev in chained_events:
        hash_failure = _validate_chained_hash_fields(ev)
        if hash_failure == "MISSING_HASH":
            return ChainVerificationResult(
                valid=False,
                chain_length=chain_length,
                verified_events=verified,
                legacy_events=legacy_count,
                first_invalid_event_id=str(ev.id),
                failure_type="MISSING_HASH",
                message=f"Event {ev.id} is missing cryptographic hash data.",
            )
        if hash_failure == "INVALID_HASH_FORMAT":
            return ChainVerificationResult(
                valid=False,
                chain_length=chain_length,
                verified_events=verified,
                legacy_events=legacy_count,
                first_invalid_event_id=str(ev.id),
                failure_type="INVALID_HASH_FORMAT",
                message=f"Event {ev.id} has invalid hash field format for a chained entry.",
            )

        # Check previous_hash linkage
        if ev.previousHash != expected_previous:
            return ChainVerificationResult(
                valid=False,
                chain_length=chain_length,
                verified_events=verified,
                legacy_events=legacy_count,
                first_invalid_event_id=str(ev.id),
                failure_type="LINKAGE_MISMATCH",
                message=(
                    f"Audit chain linkage broken at event {ev.id}. "
                    f"Stored previous_hash does not match preceding event's hash."
                ),
            )

        # Recompute and verify event_hash
        canonical = canonicalize_event(ev)
        expected_hash = compute_event_hash(canonical, ev.previousHash)
        if ev.eventHash != expected_hash:
            return ChainVerificationResult(
                valid=False,
                chain_length=chain_length,
                verified_events=verified,
                legacy_events=legacy_count,
                first_invalid_event_id=str(ev.id),
                failure_type="HASH_MISMATCH",
                message=(
                    f"Audit event integrity verification failed at event {ev.id}. "
                    f"Stored hash does not match recomputed hash — payload may have been tampered with."
                ),
            )

        expected_previous = ev.eventHash
        verified += 1

    return ChainVerificationResult(
        valid=True,
        chain_length=chain_length,
        verified_events=verified,
        legacy_events=legacy_count,
        first_invalid_event_id=None,
        failure_type=None,
        message=(
            f"Audit chain verified successfully. {verified} chained event(s) validated, "
            f"{legacy_count} legacy (pre-chain) event(s) skipped."
        ),
    )
