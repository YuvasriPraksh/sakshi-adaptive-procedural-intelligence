from __future__ import annotations

from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


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
