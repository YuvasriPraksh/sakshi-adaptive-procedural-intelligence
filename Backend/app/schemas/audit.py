from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AuditEntryCreate(BaseModel):
    """Client payload for creating an audit event. Actor identity is taken from the JWT."""

    module: str
    action: str
    entityId: Optional[str] = None
    caseId: Optional[UUID] = None
    details: Optional[str] = None
    ipAddress: Optional[str] = None
    status: Optional[str] = Field(default="success")

    model_config = ConfigDict(extra="ignore")


class AuditEntry(BaseModel):
    id: UUID
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
    createdAt: datetime
    updatedAt: datetime
    previousHash: Optional[str] = None
    eventHash: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ChainVerificationResult(BaseModel):
    """Result of verifying a case-scoped audit chain."""

    valid: bool
    chain_length: int
    verified_events: int
    legacy_events: int
    first_invalid_event_id: Optional[str] = None
    failure_type: Optional[str] = None
    message: str

    model_config = ConfigDict(from_attributes=True)

