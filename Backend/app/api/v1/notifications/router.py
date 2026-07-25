from typing import List, Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import require_access_token
from app.models.notification import Notification
from app.schemas.common import ApiResponse, PaginatedResponse
from app.schemas.notifications import NotificationOut

router = APIRouter()


@router.get("", response_model=PaginatedResponse[NotificationOut], dependencies=[Depends(require_access_token)])
async def list_notifications(
    page: int = Query(1, ge=1),
    pageSize: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
) -> dict:
    total = (await db.execute(select(func.count()).select_from(Notification))).scalar_one()
    stmt = select(Notification).order_by(Notification.createdAt.desc()).offset((page - 1) * pageSize).limit(pageSize)
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
            "totalPages": (total + pageSize - 1) // pageSize,
        },
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
