from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token
from app.models.case import Case
from app.models.risk_assessment import RiskAssessment
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.risk import RiskAssessmentCreate, RiskAssessmentOut

router = APIRouter()


@router.get("", response_model=PaginatedResponse[RiskAssessmentOut], dependencies=[Depends(require_access_token)])
async def list_risk_assessments(
    caseId: Optional[UUID] = Query(None),
    riskLevel: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    query = select(RiskAssessment)
    if caseId:
        query = query.where(RiskAssessment.case_id == caseId)
    if riskLevel:
        query = query.where(RiskAssessment.risk_level == riskLevel)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    stmt = query.order_by(RiskAssessment.created_at.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return {
        "success": True,
        "message": "Risk assessments retrieved",
        "data": items,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize,
        },
    }


@router.get("/cases/{case_id}", response_model=ApiResponse[RiskAssessmentOut], dependencies=[Depends(require_access_token)])
async def get_case_risk(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(
        select(RiskAssessment).where(RiskAssessment.case_id == case_id).order_by(RiskAssessment.created_at.desc()).limit(1)
    )
    risk = result.scalars().first()
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found.")
    return {"success": True, "message": "Risk assessment retrieved", "data": risk}


@router.post("", response_model=ApiResponse[RiskAssessmentOut], dependencies=[Depends(require_access_token)])
async def create_risk_assessment(payload: RiskAssessmentCreate, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Case).where(Case.id == UUID(payload.caseId)))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Case not found for risk assessment.")
    assessment_data = payload.model_dump(exclude_none=True)
    assessment_data["case_id"] = UUID(payload.caseId)
    del assessment_data["caseId"]
    assessment_data.setdefault("generated_at", datetime.utcnow().isoformat() + "Z")
    risk_item = RiskAssessment(**assessment_data)
    db.add(risk_item)
    await db.flush()
    return {"success": True, "message": "Risk assessment created", "data": risk_item}
