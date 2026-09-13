from __future__ import annotations

from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AISummary(BaseModel):
    caseId: str
    caseNumber: Optional[str] = None
    summary: str
    currentStage: str
    investigationStatus: str
    pendingTasks: List[str]
    missingDocuments: List[str]
    delayReasons: List[str]
    suggestedNextStep: str
    generatedAt: str

    model_config = ConfigDict(from_attributes=True)


class RiskFactor(BaseModel):
    id: str
    factor: str
    impact: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class RiskReport(BaseModel):
    caseId: str
    riskLevel: str
    riskScore: int
    riskFactors: List[RiskFactor]
    summary: str
    generatedAt: str

    model_config = ConfigDict(from_attributes=True)


class ReadinessItem(BaseModel):
    id: str
    label: str
    done: bool
    priority: str
    category: str

    model_config = ConfigDict(from_attributes=True)


class ReadinessReport(BaseModel):
    caseId: str
    overallPercent: int
    completedCount: int
    totalCount: int
    items: List[ReadinessItem]
    recommendations: List[str]
    generatedAt: str

    model_config = ConfigDict(from_attributes=True)


class MissingProcedure(BaseModel):
    id: str
    type: str
    title: str
    description: str
    priority: str
    suggestedAction: str
    daysOverdue: Optional[int] = None
    caseId: str

    model_config = ConfigDict(from_attributes=True)


class AIRecommendation(BaseModel):
    id: str
    title: str
    description: str
    priority: str
    category: str
    suggestedAction: str
    caseId: str
    deadline: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# ── AI Copilot Schemas ────────────────────────────────────────────────────────
class AIChatRequest(BaseModel):
    message: str = Field(..., description="User prompt or question to the copilot")
    caseId: Optional[str] = Field(None, description="Active case ID context")
    intent: Optional[str] = Field(None, description="Optional predefined action intent")


class AIChatResponse(BaseModel):
    summary: str
    observations: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)
    basis: List[str] = Field(default_factory=list)
    uncertainties: List[str] = Field(default_factory=list)
    missingInformation: List[str] = Field(default_factory=list)
    humanApprovalRequired: bool = True
    formattedText: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
