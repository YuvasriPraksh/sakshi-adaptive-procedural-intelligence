from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class WorkflowStage(BaseModel):
    id: str
    order: int
    title: str
    description: str
    status: str
    completedDate: Optional[str] = None
    officer: Optional[str] = None
    remarks: Optional[str] = None
    deadline: Optional[str] = None
    department: str

    model_config = ConfigDict(from_attributes=True)


class CaseDocument(BaseModel):
    id: str
    name: str
    type: str
    uploadedBy: str
    uploadedAt: str
    size: str
    url: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CaseBase(BaseModel):
    caseNumber: str
    firNumber: str
    crimeType: str
    victimCode: str
    victimAge: int
    victimGender: str
    incidentDate: str
    incidentLocation: str
    district: str
    state: str
    status: Optional[str] = "registered"
    priority: Optional[str] = "medium"
    currentStage: Optional[str] = "Registration"
    currentStageOrder: Optional[int] = 1
    totalStages: Optional[int] = 1
    assignedOfficerId: Optional[str] = None
    assignedOfficer: Optional[str] = None
    assignedStation: Optional[str] = None
    remarks: Optional[str] = None
    workflow: Optional[List[WorkflowStage]] = Field(default_factory=list)
    documents: Optional[List[CaseDocument]] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class CaseCreate(CaseBase):
    pass


class CaseUpdate(BaseModel):
    firNumber: Optional[str] = None
    crimeType: Optional[str] = None
    victimCode: Optional[str] = None
    victimAge: Optional[int] = None
    victimGender: Optional[str] = None
    incidentDate: Optional[str] = None
    incidentLocation: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    currentStage: Optional[str] = None
    currentStageOrder: Optional[int] = None
    totalStages: Optional[int] = None
    assignedOfficerId: Optional[str] = None
    assignedOfficer: Optional[str] = None
    assignedStation: Optional[str] = None
    remarks: Optional[str] = None
    workflow: Optional[List[WorkflowStage]] = None
    documents: Optional[List[CaseDocument]] = None

    model_config = ConfigDict(from_attributes=True)


class CaseOut(CaseBase):
    id: UUID
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class CaseWorkflowUpdate(BaseModel):
    id: str
    order: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    completedDate: Optional[str] = None
    officer: Optional[str] = None
    remarks: Optional[str] = None
    deadline: Optional[str] = None
    department: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CaseAssignRequest(BaseModel):
    officerId: str

    model_config = ConfigDict(from_attributes=True)
