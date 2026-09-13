"""Phase 5A — audit chain service unit and integration tests."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

import pytest

from app.models.audit_log import AuditLog
from app.services import audit_chain_service as svc
from app.tests.conftest import pytestmark_db


def _audit_row(
    *,
    row_id: uuid.UUID | None = None,
    case_id: uuid.UUID | None = None,
    previous_hash: str = svc.GENESIS_HASH,
    event_hash: str = "a" * 64,
    timestamp: str = "2026-01-01T00:00:00+00:00",
    details: str = "test",
) -> AuditLog:
    return AuditLog(
        id=row_id or uuid.uuid4(),
        module="cases",
        action="Test Action",
        user="Officer A",
        userRole="police",
        entityId="ent-1",
        caseId=case_id,
        details=details,
        ipAddress="127.0.0.1",
        status="success",
        timestamp=timestamp,
        createdAt=datetime.now(timezone.utc),
        updatedAt=datetime.now(timezone.utc),
        previousHash=previous_hash,
        eventHash=event_hash,
    )


# ── Unit tests (no database) ────────────────────────────────────────────────


def test_canonicalization_is_deterministic():
    row = _audit_row()
    first = svc.canonicalize_event(row)
    second = svc.canonicalize_event(row)
    assert first == second
    assert first.index('"action"') < first.index('"module"')


def test_canonicalization_sorts_keys_and_empty_nulls():
    import json

    row = _audit_row(case_id=None)
    row.entityId = None
    row.details = None
    canonical = svc.canonicalize_event(row)
    payload = json.loads(canonical)
    assert list(payload.keys()) == sorted(payload.keys())
    assert payload["entityId"] == ""
    assert payload["details"] == ""


def test_compute_event_hash_is_deterministic_sha256():
    canonical = '{"action":"x","id":"1"}'
    h1 = svc.compute_event_hash(canonical, svc.GENESIS_HASH)
    h2 = svc.compute_event_hash(canonical, svc.GENESIS_HASH)
    assert h1 == h2
    assert len(h1) == 64
    assert h1 != svc.compute_event_hash(canonical, "OTHER")


# ── Integration tests (PostgreSQL) ───────────────────────────────────────────


@pytestmark_db
@pytest.mark.asyncio
async def test_genesis_event(db_session):
    case_id = uuid.uuid4()
    event = await svc.create_audit_event(
        db_session,
        module="cases",
        action="Case Opened",
        user="Real User",
        user_role="police",
        case_id=case_id,
        details="genesis test",
    )
    assert event.previousHash == svc.GENESIS_HASH
    assert len(event.eventHash) == 64
    canonical = svc.canonicalize_event(event)
    assert event.eventHash == svc.compute_event_hash(canonical, svc.GENESIS_HASH)


@pytestmark_db
@pytest.mark.asyncio
async def test_multi_event_chain(db_session):
    case_id = uuid.uuid4()
    e1 = await svc.create_audit_event(
        db_session,
        module="cases",
        action="Step 1",
        user="U1",
        user_role="police",
        case_id=case_id,
    )
    e2 = await svc.create_audit_event(
        db_session,
        module="cases",
        action="Step 2",
        user="U1",
        user_role="police",
        case_id=case_id,
    )
    assert e2.previousHash == e1.eventHash
    result = await svc.verify_chain(db_session, str(case_id))
    assert result.valid is True
    assert result.verified_events == 2


@pytestmark_db
@pytest.mark.asyncio
async def test_payload_tampering_detected(db_session):
    case_id = uuid.uuid4()
    event = await svc.create_audit_event(
        db_session,
        module="cases",
        action="Immutable",
        user="U1",
        user_role="police",
        case_id=case_id,
        details="original",
    )
    event.details = "tampered"
    result = await svc.verify_chain(db_session, str(case_id))
    assert result.valid is False
    assert result.failure_type == "HASH_MISMATCH"


@pytestmark_db
@pytest.mark.asyncio
async def test_previous_hash_tampering_detected(db_session):
    case_id = uuid.uuid4()
    await svc.create_audit_event(
        db_session,
        module="cases",
        action="First",
        user="U1",
        user_role="police",
        case_id=case_id,
    )
    second = await svc.create_audit_event(
        db_session,
        module="cases",
        action="Second",
        user="U1",
        user_role="police",
        case_id=case_id,
    )
    second.previousHash = svc.GENESIS_HASH
    result = await svc.verify_chain(db_session, str(case_id))
    assert result.valid is False
    assert result.failure_type == "LINKAGE_MISMATCH"


@pytestmark_db
@pytest.mark.asyncio
async def test_missing_hash_detected(db_session):
    case_id = uuid.uuid4()
    event = await svc.create_audit_event(
        db_session,
        module="cases",
        action="Broken",
        user="U1",
        user_role="police",
        case_id=case_id,
    )
    event.eventHash = ""
    result = await svc.verify_chain(db_session, str(case_id))
    assert result.valid is False
    assert result.failure_type == "MISSING_HASH"


@pytestmark_db
@pytest.mark.asyncio
async def test_case_isolation(db_session):
    case_a = uuid.uuid4()
    case_b = uuid.uuid4()
    await svc.create_audit_event(
        db_session,
        module="cases",
        action="A1",
        user="U1",
        user_role="police",
        case_id=case_a,
    )
    await svc.create_audit_event(
        db_session,
        module="cases",
        action="B1",
        user="U1",
        user_role="police",
        case_id=case_b,
    )
    res_a = await svc.verify_chain(db_session, str(case_a))
    res_b = await svc.verify_chain(db_session, str(case_b))
    assert res_a.valid and res_b.valid
    assert res_a.verified_events == 1
    assert res_b.verified_events == 1


@pytestmark_db
@pytest.mark.asyncio
async def test_linkage_failure_on_fork(db_session):
    case_id = uuid.uuid4()
    first = await svc.create_audit_event(
        db_session,
        module="cases",
        action="Root",
        user="U1",
        user_role="police",
        case_id=case_id,
    )
    fork = _audit_row(case_id=case_id, previous_hash=first.eventHash)
    canonical = svc.canonicalize_event(fork)
    fork.eventHash = svc.compute_event_hash(canonical, fork.previousHash)
    db_session.add(fork)
    await db_session.flush()

    sibling = _audit_row(case_id=case_id, previous_hash=first.eventHash)
    canonical_s = svc.canonicalize_event(sibling)
    sibling.eventHash = svc.compute_event_hash(canonical_s, sibling.previousHash)
    db_session.add(sibling)
    await db_session.flush()

    result = await svc.verify_chain(db_session, str(case_id))
    assert result.valid is False
    assert result.failure_type == "LINKAGE_MISMATCH"


@pytestmark_db
@pytest.mark.asyncio
async def test_pure_legacy_rows_skipped(db_session):
    case_id = uuid.uuid4()
    legacy = _audit_row(
        case_id=case_id,
        previous_hash=svc.LEGACY_HASH,
        event_hash=svc.LEGACY_HASH,
    )
    db_session.add(legacy)
    await db_session.flush()

    await svc.create_audit_event(
        db_session,
        module="cases",
        action="Chained",
        user="U1",
        user_role="police",
        case_id=case_id,
    )
    result = await svc.verify_chain(db_session, str(case_id))
    assert result.valid is True
    assert result.legacy_events == 1
    assert result.verified_events == 1


@pytestmark_db
@pytest.mark.asyncio
async def test_legacy_inconsistent_fails(db_session):
    case_id = uuid.uuid4()
    bad = _audit_row(
        case_id=case_id,
        previous_hash=svc.LEGACY_HASH,
        event_hash="b" * 64,
    )
    db_session.add(bad)
    await db_session.flush()

    result = await svc.verify_chain(db_session, str(case_id))
    assert result.valid is False
    assert result.failure_type == "LEGACY_INCONSISTENT"


@pytestmark_db
@pytest.mark.asyncio
async def test_system_scope_chain(db_session):
    await svc.create_audit_event(
        db_session,
        module="auth",
        action="Login",
        user="U1",
        user_role="police",
        case_id=None,
    )
    result = await svc.verify_chain(db_session, "SYSTEM")
    assert result.valid is True
    assert result.verified_events == 1
