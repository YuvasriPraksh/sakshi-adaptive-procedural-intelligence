from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_access_token
from app.models.user import User
from app.models.evidence import EvidenceItem
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.evidence import (
    EvidenceItemCreate,
    EvidenceItemOut,
    EvidenceTransferRequest,
    EvidenceVerifyResponse,
)
from app.services import audit_chain_service

router = APIRouter()


EVIDENCE_ALERTS: List[Dict[str, Any]] = [
    {
        "id": "al1",
        "type": "integrity_failure",
        "evidenceId": "e1",
        "evidenceRef": "EVD-2024-001842-01",
        "severity": "critical",
        "message": "Hash mismatch detected on EVD-2024-001842-01. Evidence may have been tampered.",
        "timestamp": "2024-02-20T11:30:00Z",
        "resolved": False,
    },
    {
        "id": "al2",
        "type": "delayed_transfer",
        "evidenceId": "e3",
        "evidenceRef": "EVD-2024-001837-01",
        "severity": "high",
        "message": "Transfer from FSL to Police overdue by 48 hours. SLA breach on EVD-2024-001837-01.",
        "timestamp": "2024-02-19T09:00:00Z",
        "resolved": False,
    },
    {
        "id": "al3",
        "type": "expired_verification",
        "evidenceId": "e4",
        "evidenceRef": "EVD-2024-001835-02",
        "severity": "medium",
        "message": "Integrity verification expired for EVD-2024-001835-02. Re-verification required.",
        "timestamp": "2024-02-18T14:00:00Z",
        "resolved": False,
    },
]


def _build_evidence_filters(case_id: Optional[str], status: Optional[str], agency: Optional[str]):
    conditions = []
    if case_id:
        conditions.append(EvidenceItem.caseId == case_id)
    if status:
        conditions.append(EvidenceItem.status == status)
    if agency:
        conditions.append(EvidenceItem.agency == agency)
    return conditions


@router.get("/stats", response_model=ApiResponse[Dict[str, Any]], dependencies=[Depends(require_access_token)])
async def get_evidence_stats() -> dict:
    """Returns a stub stats object. Will be replaced with DB aggregation in a future phase."""
    return {
        "success": True,
        "message": "Evidence stats retrieved",
        "data": {
            "total": 0, "pendingVerification": 0, "verified": 0,
            "sharedAcrossAgencies": 0, "inTransit": 0, "courtSubmitted": 0,
            "integrityHealth": 100, "chainHealth": 100, "alertCount": 3,
        },
    }


@router.get("/alerts", response_model=ApiResponse[List[Dict[str, Any]]], dependencies=[Depends(require_access_token)])
async def get_alerts() -> dict:
    return {"success": True, "message": "Evidence alerts retrieved", "data": EVIDENCE_ALERTS}


@router.get("", response_model=PaginatedResponse[EvidenceItemOut], dependencies=[Depends(require_access_token)])
async def list_evidence(
    caseId: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    agency: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    conditions = _build_evidence_filters(caseId, status, agency)
    query = select(EvidenceItem)
    if conditions:
        query = query.where(*conditions)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one() if conditions else (await db.execute(select(func.count()).select_from(EvidenceItem))).scalar_one()
    stmt = query.order_by(EvidenceItem.createdAt.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return {
        "success": True,
        "message": "Evidence items retrieved",
        "data": items,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize,
        },
    }


@router.get("/{evidence_id}", response_model=ApiResponse[EvidenceItemOut], dependencies=[Depends(require_access_token)])
async def get_evidence(evidence_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(EvidenceItem).where(EvidenceItem.id == evidence_id))
    evidence = result.scalars().first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found.")
    return {"success": True, "message": "Evidence item retrieved", "data": evidence}


@router.post("", response_model=ApiResponse[EvidenceItemOut], dependencies=[Depends(require_access_token)])
async def create_evidence(
    payload: EvidenceItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    evidence_data = payload.model_dump(exclude_none=True)
    evidence_data.setdefault("evidenceId", f"EVD-{uuid4().hex[:10].upper()}")
    evidence_data.setdefault("caseNumber", "UNKNOWN")
    evidence_data.setdefault("type", "other")
    evidence_data.setdefault("description", "No description provided")
    evidence_data.setdefault("collectedBy", "Unknown")
    evidence_data.setdefault("collectedByRole", "Investigator")
    evidence_data.setdefault("agency", "police")
    evidence_data.setdefault("collectionDate", datetime.now(timezone.utc).date().isoformat())
    evidence_data.setdefault("collectionTime", datetime.now(timezone.utc).time().isoformat(timespec="minutes"))
    evidence_data.setdefault("gpsLocation", "Unknown")
    evidence_data.setdefault("gpsCoords", {"lat": 0.0, "lng": 0.0})
    evidence_data.setdefault("status", "registered")
    evidence_data.setdefault("currentCustody", evidence_data.get("agency", "police"))
    evidence_data.setdefault("currentOfficer", evidence_data.get("collectedBy", "Unknown"))
    evidence_data.setdefault("initialHash", evidence_data.get("currentHash", ""))
    evidence_data.setdefault("currentHash", evidence_data.get("initialHash", ""))
    evidence_data.setdefault("verificationStatus", "pending")
    evidence_data.setdefault("evidenceToken", f"TKN-{uuid4().hex[:8].upper()}")
    evidence_data.setdefault("sealNumber", f"SL-{uuid4().hex[:6].upper()}")
    evidence_data.setdefault("photographs", 0)
    evidence_data.setdefault("notes", "")
    evidence_data.pop("versions", None)
    evidence = EvidenceItem(**evidence_data)
    db.add(evidence)
    await db.flush()
    case_id_val = None
    try:
        if evidence.caseId:
            case_id_val = UUID(evidence.caseId)
    except Exception:
        pass
    await audit_chain_service.create_audit_event(
        db,
        module="evidence",
        action="EVIDENCE_CREATED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(evidence.id),
        case_id=case_id_val,
        details=f"Evidence {evidence.evidenceId} created.",
        created_by=current_user.id
    )
    await db.commit()
    await db.refresh(evidence)
    return {"success": True, "message": "Evidence registered", "data": evidence}


@router.post("/{evidence_id}/transfer", response_model=ApiResponse[EvidenceItemOut], dependencies=[Depends(require_access_token)])
async def transfer_evidence(
    evidence_id: UUID,
    payload: EvidenceTransferRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    result = await db.execute(select(EvidenceItem).where(EvidenceItem.id == evidence_id))
    evidence = result.scalars().first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found.")
    chain = evidence.chain or []
    transfer_event = {
        "id": str(uuid4()),
        "eventNumber": len(chain) + 1,
        "action": "transferred",
        "agency": evidence.currentCustody,
        "officer": payload.officer,
        "officerRole": "Custody Officer",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "purpose": payload.purpose,
        "fromAgency": evidence.currentCustody,
        "toAgency": payload.toAgency,
        "transferId": f"TRF-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
        "hashBefore": evidence.currentHash,
        "hashAfter": evidence.currentHash,
        "digitalSignature": f"SIG-{payload.officer[:6].upper()}-{datetime.now(timezone.utc).timestamp():.0f}",
        "verificationStatus": "verified",
        "remarks": payload.notes or "Transfer completed",
        "location": f"{payload.toAgency.title()} custody",
    }
    chain.append(transfer_event)
    evidence.chain = chain
    evidence.currentCustody = payload.toAgency
    evidence.currentOfficer = payload.officer
    evidence.status = "in_transit"
    await db.flush()
    
    case_id_val = None
    try:
        if evidence.caseId:
            case_id_val = UUID(evidence.caseId)
    except Exception:
        pass
    await audit_chain_service.create_audit_event(
        db,
        module="evidence",
        action="EVIDENCE_TRANSFERRED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(evidence.id),
        case_id=case_id_val,
        details=f"Evidence {evidence.evidenceId} transfer initiated to {payload.toAgency}.",
        created_by=current_user.id
    )
    await db.commit()
    await db.refresh(evidence)
    return {"success": True, "message": "Transfer initiated", "data": evidence}


@router.post("/{evidence_id}/verify", response_model=ApiResponse[EvidenceVerifyResponse], dependencies=[Depends(require_access_token)])
async def verify_evidence(
    evidence_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    result = await db.execute(select(EvidenceItem).where(EvidenceItem.id == evidence_id))
    evidence = result.scalars().first()
    if not evidence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evidence not found.")
    match = evidence.initialHash == evidence.currentHash
    evidence.verificationStatus = "verified" if match else "failed"
    evidence.lastVerified = datetime.now(timezone.utc).isoformat()
    await db.flush()
    
    case_id_val = None
    try:
        if evidence.caseId:
            case_id_val = UUID(evidence.caseId)
    except Exception:
        pass
    await audit_chain_service.create_audit_event(
        db,
        module="evidence",
        action="EVIDENCE_VERIFIED" if match else "EVIDENCE_VERIFICATION_FAILED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(evidence.id),
        case_id=case_id_val,
        details=f"Evidence {evidence.evidenceId} verification {'passed' if match else 'failed'}.",
        status="success" if match else "error",
        created_by=current_user.id
    )
    await db.commit()
    
    return {
        "success": True,
        "message": "Verification complete",
        "data": {
            "status": "verified" if match else "failed",
            "hashMatch": match,
            "details": "SHA-256 hashes match. Evidence integrity confirmed." if match else "HASH MISMATCH DETECTED. Evidence may have been tampered.",
        },
    }


# /alerts and /stats routes have been moved above /{evidence_id} to prevent UUID collision.
