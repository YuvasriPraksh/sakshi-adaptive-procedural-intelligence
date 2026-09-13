from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token
from app.models.audit_log import AuditLog
from app.schemas.audit import AuditEntry, AuditEntryCreate
from app.schemas.common import ApiResponse, PaginatedResponse

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


@router.get("/{audit_id}", response_model=ApiResponse[AuditEntry], dependencies=[Depends(require_access_token)])
async def get_audit_log(audit_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(AuditLog).where(AuditLog.id == audit_id))
    audit = result.scalars().first()
    if not audit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Audit log not found.")
    return {"success": True, "message": "Audit log retrieved", "data": audit}


@router.post("", response_model=ApiResponse[AuditEntry], dependencies=[Depends(require_access_token)])
async def create_audit_log(payload: AuditEntryCreate, db: AsyncSession = Depends(get_db)) -> dict:
    audit_data = payload.model_dump(exclude_none=True)
    audit = AuditLog(**audit_data)
    db.add(audit)
    await db.flush()
    return {"success": True, "message": "Audit log created", "data": audit}
