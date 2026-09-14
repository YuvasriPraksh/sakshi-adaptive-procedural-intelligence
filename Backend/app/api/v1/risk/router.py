from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token, get_current_user_id, get_current_user
from app.models.case import Case
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.risk import RiskAssessmentCreate, RiskAssessmentOut
from app.services.risk_service import RiskService
router = APIRouter()

async def _verify_case_access(case_id: UUID, user: User, db: AsyncSession) -> Case:
    case_res = await db.execute(select(Case).where(Case.id == case_id))
    case = case_res.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    
    if user.role not in ["admin", "supervisor", "system"] and case.assignedOfficerId != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this case.")
    return case



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
        query = query.where(RiskAssessment.caseId == caseId)
    if riskLevel:
        query = query.where(RiskAssessment.riskLevel == riskLevel)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    stmt = query.order_by(RiskAssessment.createdAt.desc()).offset((page - 1) * pageSize).limit(pageSize)
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
async def get_case_risk(case_id: UUID, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)) -> dict:
    await _verify_case_access(case_id, current_user, db)
    result = await db.execute(
        select(RiskAssessment).where(RiskAssessment.caseId == case_id).order_by(RiskAssessment.createdAt.desc()).limit(1)
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

@router.post("/{case_id}/compute", response_model=ApiResponse[RiskAssessmentOut], dependencies=[Depends(require_access_token)])
async def compute_risk_assessment(
    case_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    await _verify_case_access(case_id, current_user, db)
    service = RiskService()
    await service.compute_and_persist_with_db(case_id, db, performed_by=current_user.id)
    result = await db.execute(
        select(RiskAssessment)
        .where(RiskAssessment.caseId == case_id)
        .order_by(RiskAssessment.createdAt.desc())
        .limit(1)
    )
    risk = result.scalars().first()
    if not risk:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Risk assessment not found after computation.")
    return {"success": True, "message": "Risk assessment computed", "data": risk}

@router.get("/{case_id}/history", response_model=PaginatedResponse[RiskAssessmentOut], dependencies=[Depends(require_access_token)])
async def list_risk_history(
    case_id: UUID,
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    await _verify_case_access(case_id, current_user, db)
    query = select(RiskAssessment).where(RiskAssessment.caseId == case_id)
    total = (await db.execute(select(func.count()).select_from(query.subquery()))).scalar_one()
    stmt = query.order_by(RiskAssessment.createdAt.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return {
        "success": True,
        "message": "Risk assessment history retrieved",
        "data": items,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize,
        },
    }

