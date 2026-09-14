from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token, get_current_user
from app.models.case import Case
from app.models.notification import Notification
from app.models.user import User
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.notifications import NotificationOut

router = APIRouter()


async def _verify_case_access(case_id: UUID, user: User, db: AsyncSession) -> Case:
    case_res = await db.execute(select(Case).where(Case.id == case_id))
    case = case_res.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    if user.role not in ["admin", "supervisor", "system"] and case.assignedOfficerId != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this case.")
    return case


@router.get("", response_model=PaginatedResponse[NotificationOut], dependencies=[Depends(require_access_token)])
async def list_notifications(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None),
    caseId: Optional[str] = Query(None),
    unreadOnly: bool = Query(False),
    db: AsyncSession = Depends(get_db),
) -> dict:
    stmt = select(Notification)
    count_stmt = select(func.count()).select_from(Notification)

    filters = []
    if category:
        filters.append(Notification.category == category)
    if caseId:
        filters.append(Notification.caseId == caseId)
    if unreadOnly:
        filters.append(Notification.read == False)

    if filters:
        for f in filters:
            stmt = stmt.where(f)
            count_stmt = count_stmt.where(f)

    total = (await db.execute(count_stmt)).scalar_one()
    stmt = stmt.order_by(Notification.createdAt.desc()).offset((page - 1) * pageSize).limit(pageSize)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return {
        "success": True,
        "message": "Notifications retrieved",
        "data": items,
        "pagination": {
            "page": page,
            "pageSize": pageSize,
            "total": total,
            "totalPages": (total + pageSize - 1) // pageSize if total > 0 else 1,
        },
    }


@router.get("/case/{case_id}/early-warnings", response_model=ApiResponse[List[NotificationOut]], dependencies=[Depends(require_access_token)])
async def list_case_early_warnings(
    case_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Retrieve active early warning notifications for a specific case with case-level RBAC/IDOR authorization."""
    await _verify_case_access(case_id, current_user, db)
    stmt = (
        select(Notification)
        .where(Notification.caseId == case_id)
        .where(Notification.category == "early_warning")
        .order_by(Notification.createdAt.desc())
        .limit(10)
    )
    result = await db.execute(stmt)
    items = result.scalars().all()
    return {
        "success": True,
        "message": "Case early warnings retrieved",
        "data": items,
    }


@router.patch("/{notification_id}/read", response_model=ApiResponse[Optional[dict]], dependencies=[Depends(require_access_token)])
async def mark_notification_read(notification_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    notification.read = True
    await db.flush()
    return {"success": True, "message": "Notification marked read", "data": None}


@router.post("/mark-all-read", response_model=ApiResponse[Optional[dict]], dependencies=[Depends(require_access_token)])
async def mark_all_read(db: AsyncSession = Depends(get_db)) -> dict:
    stmt = select(Notification).where(Notification.read == False)
    result = await db.execute(stmt)
    items = result.scalars().all()
    for item in items:
        item.read = True
    await db.flush()
    return {"success": True, "message": "All notifications marked read", "data": None}


@router.delete("/{notification_id}", response_model=ApiResponse[Optional[dict]], dependencies=[Depends(require_access_token)])
async def delete_notification(notification_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    result = await db.execute(select(Notification).where(Notification.id == notification_id))
    notification = result.scalars().first()
    if not notification:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    await db.delete(notification)
    return {"success": True, "message": "Notification deleted", "data": None}


@router.get("/unread-count", response_model=ApiResponse[int], dependencies=[Depends(require_access_token)])
async def unread_count(db: AsyncSession = Depends(get_db)) -> dict:
    stmt = select(Notification).where(Notification.read == False)
    total = len((await db.execute(stmt)).scalars().all())
    return {"success": True, "message": "Unread count retrieved", "data": total}
