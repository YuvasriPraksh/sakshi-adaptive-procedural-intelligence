from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token
from app.models.case import Case
from app.models.report import Report
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.reports import ReportCreate, ReportOut

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ReportOut], dependencies=[Depends(require_access_token)])
async def list_reports(
    caseId: Optional[UUID] = Query(None),
    reportType: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    query = select(Report)
    if caseId:
        query = query.where(Report.case_id == caseId)
    if reportType:
        query = query.where(Report.report_type == reportType)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    stmt = query.order_by(Report.created_at.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return {
        "success": True,
        "message": "Reports retrieved",
        "data": items,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize,
        },
    }


@router.get("/{report_id}", response_model=ApiResponse[ReportOut], dependencies=[Depends(require_access_token)])
async def get_report(report_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Report).where(Report.id == report_id))
    report = result.scalars().first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")
    return {"success": True, "message": "Report retrieved", "data": report}


@router.post("", response_model=ApiResponse[ReportOut], dependencies=[Depends(require_access_token)])
async def create_report(payload: ReportCreate, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Case).where(Case.id == UUID(payload.caseId)))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Case not found for report.")
    report_data = payload.model_dump(exclude_none=True)
    report_data["case_id"] = UUID(payload.caseId)
    del report_data["caseId"]
    report = Report(**report_data)
    db.add(report)
    await db.flush()
    return {"success": True, "message": "Report created", "data": report}
