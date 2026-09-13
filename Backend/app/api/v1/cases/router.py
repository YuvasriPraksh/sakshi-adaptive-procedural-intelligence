from typing import Any, List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token
from app.models.case import Case
from app.schemas.case import (
    CaseAssignRequest,
    CaseCreate,
    CaseOut,
    CaseUpdate,
    CaseWorkflowUpdate,
)
from app.schemas.common import ApiResponse, PaginatedResponse, Pagination

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


@router.post("", response_model=ApiResponse[CaseOut], dependencies=[Depends(require_access_token)])
async def create_case(payload: CaseCreate, db: AsyncSession = Depends(get_db)) -> dict:
    case_data = payload.model_dump(exclude_none=True)
    case_data.setdefault("caseNumber", f"SAKSHI/{uuid4().hex[:8]}" )
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
    return {"success": True, "message": "Case registered", "data": case}


@router.patch("/{case_id}", response_model=ApiResponse[CaseOut], dependencies=[Depends(require_access_token)])
async def update_case(case_id: UUID, payload: CaseUpdate, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    update_data = payload.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(case, key, value)
    await db.flush()
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
async def assign_officer(case_id: UUID, payload: CaseAssignRequest, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Case).where(Case.id == case_id))
    case = result.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    case.assignedOfficerId = payload.officerId
    case.assignedOfficer = payload.officerId
    await db.flush()
    return {"success": True, "message": "Officer assigned", "data": None}
