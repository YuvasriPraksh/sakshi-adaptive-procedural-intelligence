from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class WorkflowStageCreate(BaseModel):
    stageId: str
    order: int
    title: str
    description: str
    status: str
    completedDate: Optional[str] = None
    officer: Optional[str] = None
    remarks: Optional[str] = None
    deadline: Optional[str] = None
    department: Optional[str] = "police"

    model_config = ConfigDict(from_attributes=True)


class WorkflowStageOut(WorkflowStageCreate):
    id: UUID
    caseId: str
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class WorkflowHistoryOut(BaseModel):
    id: UUID
    caseId: str
    workflowId: UUID
    previousStatus: str
    newStatus: str
    changedBy: str
    changedAt: str
    remarks: Optional[str] = None
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
