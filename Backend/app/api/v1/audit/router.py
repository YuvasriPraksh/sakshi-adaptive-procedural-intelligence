"""
Audit API router — Phase 5: cryptographic chain integration.

New endpoint:
  GET /audit/verify/{scope}  — verify the chain for a case_id or "system"

Security:
  - All endpoints require authentication.
  - event_hash and previous_hash are NEVER accepted from clients.
  - Hashes are computed server-side only.
"""

from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import JSONResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, require_access_token
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit import AuditEntry, AuditEntryCreate, ChainVerificationResult
from app.schemas.common import ApiResponse, PaginatedResponse
from app.services import audit_chain_service

router = APIRouter()


@router.get("", response_model=PaginatedResponse[AuditEntry], dependencies=[Depends(require_access_token)])
async def list_audit_logs(
    module: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    caseId: Optional[UUID] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    query = select(AuditLog)
    if module:
        query = query.where(AuditLog.module == module)
    if status:
        query = query.where(AuditLog.status == status)
    if caseId:
        query = query.where(AuditLog.caseId == caseId)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    stmt = query.order_by(AuditLog.createdAt.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return {
        "success": True,
        "message": "Audit logs retrieved",
        "data": items,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize,
        },
    }


@router.get("/verify/{scope}", dependencies=[Depends(require_access_token)])
async def verify_audit_chain(scope: str, db: AsyncSession = Depends(get_db)) -> JSONResponse:
    """
    Verify the tamper-evident audit chain for a given case (UUID) or "system" scope.

    scope: a case UUID string, or the literal string "system".

    Returns a structured verification result including validity, event counts,
    and the first failing event if tampering is detected.

    Hashes are NEVER modifiable through this endpoint.
    """
    # Normalise scope
    scope_key = "SYSTEM" if scope.lower() == "system" else scope

    # Validate UUID format if not SYSTEM
    if scope_key != "SYSTEM":
        try:
            UUID(scope_key)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="scope must be a valid UUID (case_id) or the string 'system'.",
            )

    result = await audit_chain_service.verify_chain(db, scope_key)
    body = {
        "success": result.valid,
        "message": result.message,
        "data": ChainVerificationResult(**result.to_dict()).model_dump(),
    }
    http_status = status.HTTP_200_OK if result.valid else status.HTTP_409_CONFLICT
    return JSONResponse(status_code=http_status, content=body)


@router.get("/{audit_id}", response_model=ApiResponse[AuditEntry], dependencies=[Depends(require_access_token)])
async def get_audit_log(audit_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(AuditLog).where(AuditLog.id == audit_id))
    audit = result.scalars().first()
    if not audit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log not found.")
    return {"success": True, "message": "Audit log retrieved", "data": audit}


@router.post("", response_model=ApiResponse[AuditEntry], dependencies=[Depends(require_access_token)])
async def create_audit_log(
    payload: AuditEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Create a new audit log entry.

    Note: event_hash and previous_hash are computed server-side.
    Actor user/userRole are taken from the authenticated JWT session, not the client body.
    """
    audit = await audit_chain_service.create_audit_event(
        db,
        module=payload.module,
        action=payload.action,
        user=current_user.name,
        user_role=current_user.role,
        entity_id=payload.entityId,
        case_id=payload.caseId,
        details=payload.details,
        ip_address=payload.ipAddress,
        status=payload.status or "success",
        created_by=current_user.id,
    )
    await db.flush()
    await db.refresh(audit)
    return {"success": True, "message": "Audit log created", "data": audit}

