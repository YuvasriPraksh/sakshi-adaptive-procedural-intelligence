from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token
from app.models.case import Case
from app.models.workflow import Workflow
from app.models.workflow_history import WorkflowHistory
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.workflow import WorkflowHistoryOut, WorkflowStageCreate, WorkflowStageOut

router = APIRouter()


@router.get("/cases/{case_id}", response_model=ApiResponse[List[WorkflowStageOut]], dependencies=[Depends(require_access_token)])
async def get_workflow_for_case(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Workflow).where(Workflow.case_id == case_id).order_by(Workflow.order))
    stages = result.scalars().all()
    return {"success": True, "message": "Workflow stages retrieved", "data": stages}


@router.get("/cases/{case_id}/history", response_model=ApiResponse[List[WorkflowHistoryOut]], dependencies=[Depends(require_access_token)])
async def get_workflow_history(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(WorkflowHistory).where(WorkflowHistory.case_id == case_id).order_by(WorkflowHistory.changed_at.desc()))
    history = result.scalars().all()
    return {"success": True, "message": "Workflow history retrieved", "data": history}


@router.post("/cases/{case_id}", response_model=ApiResponse[WorkflowStageOut], dependencies=[Depends(require_access_token)])
async def create_workflow_stage(case_id: UUID, payload: WorkflowStageCreate, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Case not found for workflow stage.")
    stage_data = payload.model_dump(exclude_none=True)
    stage_data["caseId"] = case_id
    stage = Workflow(**stage_data)
    db.add(stage)
    await db.flush()
    return {"success": True, "message": "Workflow stage created", "data": stage}


@router.patch("/{stage_id}", response_model=ApiResponse[WorkflowStageOut], dependencies=[Depends(require_access_token)])
async def update_workflow_stage(stage_id: UUID, payload: WorkflowStageCreate, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Workflow).where(Workflow.id == stage_id))
    stage = result.scalars().first()
    if not stage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Workflow stage not found.")
    previous_status = stage.status
    updates = payload.model_dump(exclude_none=True)
    for key, value in updates.items():
        setattr(stage, key, value)
    if "status" in updates and previous_status != updates.get("status"):
        history = WorkflowHistory(
            caseId=stage.caseId,
            workflowId=stage.id,
            previousStatus=previous_status,
            newStatus=updates.get("status", stage.status),
            changedBy="system",
            changedAt=datetime.utcnow().isoformat() + "Z",
            remarks=updates.get("remarks", stage.remarks or ""),
        )
        db.add(history)
    await db.flush()
    return {"success": True, "message": "Workflow stage updated", "data": stage}
