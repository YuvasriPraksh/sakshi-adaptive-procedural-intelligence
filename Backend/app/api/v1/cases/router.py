from datetime import datetime, timezone
from typing import Any, List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, get_current_user_id, require_access_token
from app.models.case import Case
from app.models.user import User
from app.models.workflow import Workflow
from app.models.workflow_history import WorkflowHistory
from app.schemas.case import (
    CaseAssignRequest,
    CaseCreate,
    CaseOut,
    CaseUpdate,
    CaseWorkflowUpdate,
)
from app.schemas.common import ApiResponse, PaginatedResponse, Pagination
from app.schemas.workflow import (
    ProceduralGraphResponse,
    StageTransitionRequest,
    WorkflowStageOut,
)
from app.services import audit_chain_service
from app.services.dpog_service import DPOGEngine

router = APIRouter()


def _build_case_filters(
    status: Optional[str],
    priority: Optional[str],
    officer: Optional[str],
    search: Optional[str],
):
    conditions = []
    if status:
        conditions.append(Case.status == status)
    if priority:
        conditions.append(Case.priority == priority)
    if officer:
        conditions.append(Case.assignedOfficer == officer)
    if search:
        q = f"%{search}%"
        conditions.append(
            or_(
                Case.caseNumber.ilike(q),
                Case.victimCode.ilike(q),
                Case.assignedOfficer.ilike(q),
            )
        )
    return conditions


@router.get("", response_model=PaginatedResponse[CaseOut], dependencies=[Depends(require_access_token)])
async def list_cases(
    status: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    officer: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    filters = _build_case_filters(status, priority, officer, search)
    base_query = select(Case)
    if filters:
        base_query = base_query.where(*filters)
    count_query = select(func.count()).select_from(base_query.subquery())
    total = (await db.execute(count_query)).scalar_one()
    stmt = base_query.order_by(Case.createdAt.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return {
        "success": True,
        "message": "Cases retrieved",
        "data": items,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize,
        },
    }


@router.get("/{case_id}", response_model=ApiResponse[CaseOut], dependencies=[Depends(require_access_token)])
async def get_case(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    return {"success": True, "message": "Case retrieved", "data": case}


# ── D-POG Dynamic Procedural Obligation Graph APIs ────────────────────────────
@router.get("/{case_id}/procedural-graph", response_model=ApiResponse[ProceduralGraphResponse], dependencies=[Depends(require_access_token)])
async def get_procedural_graph(case_id: UUID, db: AsyncSession = Depends(get_db)) -> dict:
    """
    Retrieve the dynamic Procedural Obligation Graph (D-POG) for a case.
    Evaluates real-time prerequisite states, root blockers, downstream impacts, and readiness score.
    """
    case_res = await db.execute(select(Case).where(Case.id == case_id))
    case = case_res.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    stages_res = await db.execute(select(Workflow).where(Workflow.caseId == case_id).order_by(Workflow.order))
    stages = stages_res.scalars().all()

    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    graph_data = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=stages)

    return {
        "success": True,
        "message": "Dynamic Procedural Obligation Graph evaluated successfully",
        "data": graph_data,
    }


@router.post("/{case_id}/workflow/{stage_id}/transition", response_model=ApiResponse[ProceduralGraphResponse])
async def transition_workflow_stage(
    case_id: UUID,
    stage_id: str,
    payload: StageTransitionRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    Transition an obligation stage status in PostgreSQL and return the recalculated D-POG graph.
    Automatically logs state change to WorkflowHistory and updates dependent nodes.
    """
    case_res = await db.execute(select(Case).where(Case.id == case_id))
    case = case_res.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    user_res = await db.execute(select(User).where(User.id == UUID(user_id)))
    user = user_res.scalars().first()
    user_display = f"{user.name} ({user.role})" if user else "Officer"

    stages_res = await db.execute(select(Workflow).where(Workflow.caseId == case_id).order_by(Workflow.order))
    stages = stages_res.scalars().all()

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
    elif not target_stage.officer and user:
        target_stage.officer = user.name

    if payload.remarks:
        target_stage.remarks = payload.remarks

    now_iso = datetime.now(timezone.utc).isoformat()
    if target_stage.status == "completed":
        target_stage.completedDate = payload.completedDate or now_iso
    else:
        target_stage.completedDate = None

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

    await db.commit()

    # Refetch and evaluate updated graph
    stages_res = await db.execute(select(Workflow).where(Workflow.caseId == case_id).order_by(Workflow.order))
    updated_stages = stages_res.scalars().all()

    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    updated_graph = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=updated_stages)

    # Event-triggered procedural risk recomputation & early-warning evaluation (Phase 7D)
    from app.services.risk_service import RiskService
    risk_svc = RiskService()
    await risk_svc.compute_and_persist_with_db(case.id, db, performed_by=user.id if user else None)

    return {
        "success": True,
        "message": f"Stage {target_stage.title} transitioned to {target_stage.status} successfully",
        "data": updated_graph,
    }


@router.post("", response_model=ApiResponse[CaseOut], dependencies=[Depends(require_access_token)])
async def create_case(
    payload: CaseCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    case_data = payload.model_dump(exclude_none=True)
    case_data.setdefault("caseNumber", f"SAKSHI/{uuid4().hex[:8]}")
    case_data.setdefault("firNumber", "FIR-UNKNOWN")
    case_data.setdefault("crimeType", "other")
    case_data.setdefault("victimCode", "UNKNOWN")
    case_data.setdefault("victimAge", 0)
    case_data.setdefault("victimGender", "F")
    case_data.setdefault("incidentDate", datetime.now(timezone.utc).isoformat())
    case_data.setdefault("incidentLocation", "Unknown")
    case_data.setdefault("district", "Unknown")
    case_data.setdefault("state", "Unknown")
    case = Case(**case_data)
    db.add(case)
    await db.flush()
    await audit_chain_service.create_audit_event(
        db,
        module="cases",
        action="CASE_CREATED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(case.id),
        case_id=case.id,
        details=f"Case {case.caseNumber} created.",
        created_by=current_user.id
    )
    await db.commit()
    await db.refresh(case)
    return {"success": True, "message": "Case registered", "data": case}


@router.patch("/{case_id}", response_model=ApiResponse[CaseOut], dependencies=[Depends(require_access_token)])
async def update_case(
    case_id: UUID,
    payload: CaseUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    update_data = payload.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(case, key, value)
    await db.flush()
    await audit_chain_service.create_audit_event(
        db,
        module="cases",
        action="CASE_UPDATED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(case.id),
        case_id=case.id,
        details=f"Case {case.caseNumber} updated fields: {list(update_data.keys())}.",
        created_by=current_user.id
    )
    await db.commit()
    await db.refresh(case)
    return {"success": True, "message": "Case updated", "data": case}


@router.patch("/{case_id}/workflow/{stage_id}", response_model=ApiResponse[dict], dependencies=[Depends(require_access_token)])
async def update_workflow_stage(
    case_id: UUID,
    stage_id: str,
    payload: CaseWorkflowUpdate,
    db: AsyncSession = Depends(get_db),
) -> dict:
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    workflow = case.workflow or []
    stage = next((item for item in workflow if item.get("id") == stage_id), None)
    if stage:
        stage.update(payload.model_dump(exclude_none=True))
    else:
        new_stage = payload.model_dump(exclude_none=True)
        new_stage["id"] = stage_id
        workflow.append(new_stage)
        stage = new_stage
    case.workflow = workflow
    if payload.status:
        case.currentStage = payload.title or case.currentStage
        case.currentStageOrder = payload.order or case.currentStageOrder
    await db.flush()
    return {"success": True, "message": "Workflow stage updated", "data": stage}


@router.post("/{case_id}/assign", response_model=ApiResponse[Optional[dict]], dependencies=[Depends(require_access_token)])
async def assign_officer(
    case_id: UUID,
    payload: CaseAssignRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> dict:
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    case.assignedOfficerId = payload.officerId
    case.assignedOfficer = payload.officerId
    await db.flush()
    await audit_chain_service.create_audit_event(
        db,
        module="cases",
        action="CASE_ASSIGNED",
        user=current_user.name,
        user_role=current_user.role,
        entity_id=str(case.id),
        case_id=case.id,
        details=f"Case {case.caseNumber} assigned to officer {payload.officerId}.",
        created_by=current_user.id
    )
    await db.commit()
    return {"success": True, "message": "Officer assigned", "data": None}
