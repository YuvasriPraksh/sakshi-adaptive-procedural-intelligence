from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RiskFactor(BaseModel):
    id: str
    factor: str
    impact: str
    description: str

    model_config = ConfigDict(from_attributes=True)


class RiskAssessmentBase(BaseModel):
    caseId: str | UUID
    riskLevel: str
    riskScore: int
    riskFactors: List[RiskFactor]
    summary: str
    generatedAt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class RiskAssessmentCreate(RiskAssessmentBase):
    pass


class RiskAssessmentOut(RiskAssessmentBase):
    id: UUID
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
