from __future__ import annotations

from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class NotificationOut(BaseModel):
    id: UUID
    type: str
    title: str
    message: str
    priority: str
    read: bool
    caseId: Optional[str] = None
    caseNumber: Optional[str] = None
    createdAt: str
    actionUrl: Optional[str] = None
    category: Optional[str] = "general"
    eventCode: Optional[str] = None
    detailsJson: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)
