from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token
from app.models.case import Case
from app.models.court_readiness import CourtReadiness
from app.schemas.common import ApiResponse
from app.schemas.readiness import CourtReadinessCreate, CourtReadinessOut

router = APIRouter()


@router.get("/cases/{case_id}", response_model=ApiResponse[CourtReadinessOut], dependencies=[Depends(require_access_token)])
async def get_case_readiness(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(
        select(CourtReadiness).where(CourtReadiness.caseId == case_id).order_by(CourtReadiness.createdAt.desc()).limit(1)
    )
    readiness = result.scalars().first()
    if not readiness:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Court readiness record not found.")
    return {"success": True, "message": "Court readiness retrieved", "data": readiness}


@router.post("", response_model=ApiResponse[CourtReadinessOut], dependencies=[Depends(require_access_token)])
async def create_case_readiness(payload: CourtReadinessCreate, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Case).where(Case.id == UUID(payload.caseId)))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Case not found for readiness assessment.")
    readiness_data = payload.model_dump(exclude_none=True)
    readiness_data["case_id"] = UUID(payload.caseId)
    del readiness_data["caseId"]
    readiness_data.setdefault("generated_at", datetime.utcnow().isoformat() + "Z")
    readiness = CourtReadiness(**readiness_data)
    db.add(readiness)
    await db.flush()
    return {"success": True, "message": "Court readiness created", "data": readiness}
