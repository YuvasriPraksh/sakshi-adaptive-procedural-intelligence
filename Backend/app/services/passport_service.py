import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.passport import AccountabilityPassport
from app.models.case import Case
from app.models.workflow import Workflow
from app.schemas.passport import AccountabilityPassportOut, PassportVerificationResult
from app.services.dpog_service import DPOGEngine
from app.services.audit_chain_service import verify_chain, _get_chain_tail, _scope_key, GENESIS_HASH


def canonicalize_passport(passport: AccountabilityPassport) -> str:
    def _str(v):
        if v is None:
            return ""
        return str(v)

    def _dict(v):
        if v is None:
            return "{}"
        return json.dumps(v, sort_keys=True, separators=(",", ":"), ensure_ascii=False)

    payload = {
        "auditVerification": _dict(passport.auditVerification),
        "caseReference": _str(passport.caseReference),
        "generatedAt": _str(passport.generatedAt),
        "generatedById": _str(passport.generatedById),
        "integrityReference": _str(passport.integrityReference),
        "obligationSummary": _dict(passport.obligationSummary),
        "proceduralState": _dict(passport.proceduralState),
    }
    return json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def compute_passport_hash(canonical: str) -> str:
    data = canonical.encode("utf-8")
    return hashlib.sha256(data).hexdigest()


async def generate_passport(
    db: AsyncSession,
    case_id: UUID,
    generated_by: str,
    generated_by_id: UUID,
) -> AccountabilityPassportOut:
    # 1. Fetch Case and Workflows
    stmt = select(Case).where(Case.id == case_id)
    result = await db.execute(stmt)
    case = result.scalars().first()
    if not case:
        raise ValueError("Case not found")
        
    wf_stmt = select(Workflow).where(Workflow.caseId == case_id)
    wf_result = await db.execute(wf_stmt)
    workflows = wf_result.scalars().all()

    # 2. Evaluate D-POG
    engine = DPOGEngine(crime_type=case.crimeType)
    dpog_result = engine.evaluate_graph(str(case.id), case.caseNumber, workflows)

    procedural_state = {
        "status": dpog_result["readiness"]["status"],
        "readinessScore": dpog_result["readiness"]["score"],
        "totalStages": dpog_result["readiness"]["totalStages"],
        "completedStages": dpog_result["readiness"]["completedStages"],
    }
    
    obligation_summary = {
        "satisfied": dpog_result["readiness"]["completedStages"],
        "pending": dpog_result["readiness"]["actionableStages"],
        "blocked": dpog_result["readiness"]["blockedStages"],
    }

    # 3. Verify Audit Chain and get Integrity Reference
    scope_key = _scope_key(case_id)
    chain_verification = await verify_chain(db, scope_key)
    
    audit_verification = {
        "verifiedEvents": chain_verification.verified_events,
        "legacyEvents": chain_verification.legacy_events,
        "isValid": chain_verification.valid,
    }

    tail = await _get_chain_tail(db, scope_key)
    integrity_reference = tail.eventHash if tail else GENESIS_HASH

    # 4. Construct Passport
    now_utc = datetime.now(timezone.utc)
    short_uuid = str(uuid.uuid4()).split('-')[0].upper()
    passport_id = f"PASS-{now_utc.year}-{short_uuid}"

    passport = AccountabilityPassport(
        id=uuid.uuid4(),
        passportId=passport_id,
        caseId=case_id,
        caseReference=case.caseNumber,
        generatedAt=now_utc,
        generatedBy=generated_by,
        generatedById=generated_by_id,
        proceduralState=procedural_state,
        obligationSummary=obligation_summary,
        auditVerification=audit_verification,
        integrityReference=integrity_reference,
        passportHash="",
    )

    # 5. Hash Passport
    canonical = canonicalize_passport(passport)
    passport.passportHash = compute_passport_hash(canonical)

    db.add(passport)
    await db.commit()
    await db.refresh(passport)

    return AccountabilityPassportOut.model_validate(passport)


async def get_passports_for_case(db: AsyncSession, case_id: UUID) -> List[AccountabilityPassportOut]:
    stmt = select(AccountabilityPassport).where(AccountabilityPassport.caseId == case_id).order_by(AccountabilityPassport.generatedAt.desc())
    result = await db.execute(stmt)
    passports = result.scalars().all()
    return [AccountabilityPassportOut.model_validate(p) for p in passports]


async def get_passport(db: AsyncSession, passport_id: str) -> Optional[AccountabilityPassportOut]:
    stmt = select(AccountabilityPassport).where(AccountabilityPassport.passportId == passport_id)
    result = await db.execute(stmt)
    passport = result.scalars().first()
    if passport:
        return AccountabilityPassportOut.model_validate(passport)
    return None


async def verify_passport(db: AsyncSession, passport_id: str) -> PassportVerificationResult:
    # 1. Retrieve Passport
    stmt = select(AccountabilityPassport).where(AccountabilityPassport.passportId == passport_id)
    result = await db.execute(stmt)
    passport = result.scalars().first()
    if not passport:
        raise ValueError("Passport not found")

    # 2. Check Passport Integrity
    canonical = canonicalize_passport(passport)
    expected_hash = compute_passport_hash(canonical)
    
    if passport.passportHash != expected_hash:
        return PassportVerificationResult(
            status="TAMPER_DETECTED",
            isCurrent=False,
            details="Passport data has been modified. Recomputed hash does not match stored hash.",
            passportId=passport.passportId,
            caseReference=passport.caseReference,
        )

    # 3. Check Underlying Audit Chain Integrity
    scope_key = _scope_key(passport.caseId)
    chain_verification = await verify_chain(db, scope_key)
    
    if not chain_verification.valid:
        return PassportVerificationResult(
            status="TAMPER_DETECTED",
            isCurrent=False,
            details=f"Underlying audit chain tampered: {chain_verification.message}",
            passportId=passport.passportId,
            caseReference=passport.caseReference,
        )
        
    # 4. Check Staleness
    tail = await _get_chain_tail(db, scope_key)
    current_integrity = tail.eventHash if tail else GENESIS_HASH
    
    if passport.integrityReference != current_integrity:
        return PassportVerificationResult(
            status="OUTDATED",
            isCurrent=False,
            details="Passport is cryptographically valid, but the case has progressed since it was generated.",
            passportId=passport.passportId,
            caseReference=passport.caseReference,
        )
        
    # 5. Verified and Current
    return PassportVerificationResult(
        status="VERIFIED",
        isCurrent=True,
        details="Passport is cryptographically valid and represents the current case state.",
        passportId=passport.passportId,
        caseReference=passport.caseReference,
    )
