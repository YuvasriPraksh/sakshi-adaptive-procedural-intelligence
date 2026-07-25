from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AuditEntryBase(BaseModel):
    module: str
    action: str
    user: str
    userRole: str
    entityId: Optional[str] = None
    caseId: Optional[UUID] = None
    details: Optional[str] = None
    ipAddress: Optional[str] = None
    status: Optional[str] = Field(default="success")
    timestamp: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class AuditEntryCreate(AuditEntryBase):
    pass


class AuditEntry(AuditEntryBase):
    id: UUID
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
