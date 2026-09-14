from datetime import datetime, timezone
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, get_current_user_id, require_access_token
from app.models.case import Case
from app.models.workflow import Workflow
from app.models.workflow_history import WorkflowHistory
from app.models.user import User
from app.schemas.common import ApiResponse
from app.schemas.workflow import (
    ProceduralGraphResponse,
    StageTransitionRequest,
    WorkflowHistoryOut,
    WorkflowStageCreate,
    WorkflowStageOut,
)
from app.services import audit_chain_service
from app.services.dpog_service import DPOGEngine

router = APIRouter()


@router.get("/cases/{case_id}/procedural-graph", response_model=ApiResponse[ProceduralGraphResponse], dependencies=[Depends(require_access_token)])
async def get_procedural_graph(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    """
    Retrieve the dynamic Procedural Obligation Graph (D-POG) for a case.
    Evaluates real-time prerequisite states, root blockers, downstream impacts, and readiness score.
    """
    # Fetch Case
    case_res = await db.execute(select(Case).where(Case.id == case_id))
    case = case_res.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    # Fetch Workflow Stages
    stages_res = await db.execute(select(Workflow).where(Workflow.caseId == case_id).order_by(Workflow.order))
    stages = stages_res.scalars().all()

    # Evaluate graph using DPOGEngine
    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    graph_data = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=stages)

    return {
        "success": True,
        "message": "Dynamic Procedural Obligation Graph evaluated successfully",
        "data": graph_data,
    }


@router.post("/cases/{case_id}/workflow/{stage_id}/transition", response_model=ApiResponse[ProceduralGraphResponse])
async def transition_workflow_stage(
    case_id: UUID,
    stage_id: str,
    payload: StageTransitionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Transition an obligation stage status in PostgreSQL and return the recalculated D-POG graph.
    Automatically logs state change to WorkflowHistory and updates dependent nodes.
    """
    # Fetch Case
    case_res = await db.execute(select(Case).where(Case.id == case_id))
    case = case_res.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    user_display = f"{current_user.name} ({current_user.role})"

    # Fetch Stages for Case
    stages_res = await db.execute(select(Workflow).where(Workflow.caseId == case_id).order_by(Workflow.order))
    stages = stages_res.scalars().all()

    # Find the target stage by stageId string or order
    target_stage = None
    for stg in stages:
        if stg.stageId == stage_id or str(stg.id) == stage_id:
            target_stage = stg
            break

    if not target_stage:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Stage {stage_id} not found in case workflow.")

    previous_status = target_stage.status
    target_stage.status = payload.newStatus.lower()
    
    if payload.officer:
        target_stage.officer = payload.officer
    elif not target_stage.officer:
        target_stage.officer = current_user.name

    if payload.remarks:
        target_stage.remarks = payload.remarks

    now_iso = datetime.now(timezone.utc).isoformat()
    if target_stage.status == "completed":
        target_stage.completedDate = payload.completedDate or now_iso
    else:
        target_stage.completedDate = None

    # Record in WorkflowHistory
    history_entry = WorkflowHistory(
        caseId=case.id,
        workflowId=target_stage.id,
        previousStatus=previous_status,
        newStatus=target_stage.status,
        changedBy=user_display,
        changedAt=now_iso,
        remarks=payload.remarks or f"Transitioned stage to {target_stage.status}",
    )
    db.add(history_entry)

    await audit_chain_service.create_audit_event(
        db,
        module="workflow",
        action="WORKFLOW_STAGE_COMPLETED" if target_stage.status == "completed" else "WORKFLOW_STAGE_UPDATED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(target_stage.id),
        case_id=case.id,
        details=f"Stage {target_stage.title} transitioned to {target_stage.status}. Remarks: {payload.remarks}",
        created_by=current_user.id
    )
    await db.commit()

    # Refetch stages to evaluate updated graph
    stages_res = await db.execute(select(Workflow).where(Workflow.caseId == case_id).order_by(Workflow.order))
    updated_stages = stages_res.scalars().all()

    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    updated_graph = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=updated_stages)

    # Event-triggered procedural risk recomputation & early-warning evaluation (Phase 7D)
    from app.services.risk_service import RiskService
    risk_svc = RiskService()
    await risk_svc.compute_and_persist_with_db(case.id, db, performed_by=current_user.id)

    return {
        "success": True,
        "message": f"Stage {target_stage.title} transitioned to {target_stage.status} successfully",
        "data": updated_graph,
    }


@router.get("/cases/{case_id}", response_model=ApiResponse[List[WorkflowStageOut]], dependencies=[Depends(require_access_token)])
async def get_workflow_for_case(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Workflow).where(Workflow.caseId == case_id).order_by(Workflow.order))
    stages = result.scalars().all()
    return {"success": True, "message": "Workflow stages retrieved", "data": stages}


@router.get("/cases/{case_id}/history", response_model=ApiResponse[List[WorkflowHistoryOut]], dependencies=[Depends(require_access_token)])
async def get_workflow_history(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(WorkflowHistory).where(WorkflowHistory.caseId == case_id).order_by(WorkflowHistory.changedAt.desc()))
    history = result.scalars().all()
    return {"success": True, "message": "Workflow history retrieved", "data": history}


@router.post("/cases/{case_id}", response_model=ApiResponse[WorkflowStageOut], dependencies=[Depends(require_access_token)])
async def create_workflow_stage(
    case_id: UUID,
    payload: WorkflowStageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Case not found for workflow stage.")
    stage_data = payload.model_dump(exclude_none=True)
    stage_data["caseId"] = case_id
    stage = Workflow(**stage_data)
    db.add(stage)
    await db.flush()
    await audit_chain_service.create_audit_event(
        db,
        module="workflow",
        action="WORKFLOW_STAGE_CREATED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(stage.id),
        case_id=case_id,
        details=f"Workflow stage {stage.title} created.",
        created_by=current_user.id
    )
    await db.commit()
    await db.refresh(stage)
    return {"success": True, "message": "Workflow stage created", "data": stage}


@router.patch("/{stage_id}", response_model=ApiResponse[WorkflowStageOut], dependencies=[Depends(require_access_token)])
async def update_workflow_stage(
    stage_id: UUID,
    payload: WorkflowStageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
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
            changedAt=datetime.now(timezone.utc).isoformat(),
            remarks=updates.get("remarks", stage.remarks or ""),
        )
        db.add(history)
    await db.flush()
    await audit_chain_service.create_audit_event(
        db,
        module="workflow",
        action="WORKFLOW_STAGE_UPDATED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(stage.id),
        case_id=stage.caseId,
        details=f"Workflow stage {stage.title} updated.",
        created_by=current_user.id
    )
    await db.commit()
    await db.refresh(stage)
    return {"success": True, "message": "Workflow stage updated", "data": stage}
