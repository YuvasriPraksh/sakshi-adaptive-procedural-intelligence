from __future__ import annotations

from datetime import datetime
from typing import Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CourtReadinessBase(BaseModel):
    caseId: str
    status: str
    readinessPercent: int
    missingItems: List[Dict[str, str]]
    recommendations: List[Dict[str, str]]
    generatedAt: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CourtReadinessCreate(CourtReadinessBase):
    pass


class CourtReadinessOut(CourtReadinessBase):
    id: UUID
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
