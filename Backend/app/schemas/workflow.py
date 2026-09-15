from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, List, Optional
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
    caseId: UUID
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


class StageTransitionRequest(BaseModel):
    newStatus: str  # "completed" | "in_progress" | "pending"
    officer: Optional[str] = None
    remarks: Optional[str] = None
    completedDate: Optional[str] = None


class RootBlockerInfoOut(BaseModel):
    immediateBlockerId: str
    immediateBlockerTitle: str
    immediateBlockerDepartment: str
    rootBlockerId: str
    rootBlockerTitle: str
    rootBlockerDepartment: str
    blockerChain: List[str]
    explanation: str
    downstreamImpactCount: int


class DownstreamImpactInfoOut(BaseModel):
    directDependentIds: List[str]
    totalAffectedCount: int
    affectedStageIds: List[str]
    affectsStatutoryChargesheet: bool


class GraphNodeOut(BaseModel):
    id: str
    dbId: Optional[str] = None
    stageId: str
    order: int
    title: str
    description: str
    department: str
    responsibleRole: str
    rawStatus: str
    calculatedStatus: str
    isCompleted: bool
    isBlocked: bool
    isActionable: bool
    isCriticalPath: bool
    deadline: Optional[str] = None
    statutoryDeadlineLabel: str
    officer: Optional[str] = None
    completedDate: Optional[str] = None
    remarks: Optional[str] = None
    evidenceRequired: List[str]
    prerequisites: List[str]
    incompletePrerequisites: List[str]
    directDependents: List[str]
    rootBlockerInfo: Optional[RootBlockerInfoOut] = None
    downstreamImpactInfo: DownstreamImpactInfoOut


class GraphEdgeOut(BaseModel):
    id: str
    source: str
    target: str
    type: str = "smoothstep"
    animated: bool = False
    isBlockedPath: bool = False
    style: Dict[str, Any]
    markerEnd: Dict[str, Any]


class FactorBreakdownOut(BaseModel):
    baseCompletionPoints: float
    activeProgressPoints: float
    pathIntegrityPoints: float
    blockerDeductions: float


class ReadinessOut(BaseModel):
    score: int
    percentage: str
    status: str
    completedStages: int
    totalStages: int
    blockedStages: int
    actionableStages: int
    inProgressStages: int
    factorBreakdown: FactorBreakdownOut
    explanation: str


class ActiveBlockerSummaryOut(BaseModel):
    stageId: str
    title: str
    department: str
    rootBlocker: Optional[str] = None
    affectedDownstreamCount: int


class NextActionableSummaryOut(BaseModel):
    stageId: str
    title: str
    department: str
    status: str
    deadline: Optional[str] = None


class GraphSummaryOut(BaseModel):
    activeBlockers: List[ActiveBlockerSummaryOut]
    nextActionable: List[NextActionableSummaryOut]
    isProcedurallyIntact: bool


class ProceduralGraphResponse(BaseModel):
    caseId: str
    caseNumber: str
    templateId: str
    crimeType: str
    totalStages: int
    readiness: ReadinessOut
    nodes: List[GraphNodeOut]
    edges: List[GraphEdgeOut]
    summary: GraphSummaryOut
