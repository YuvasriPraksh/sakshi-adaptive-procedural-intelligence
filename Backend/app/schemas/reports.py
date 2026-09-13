from __future__ import annotations

from typing import Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class ReportBase(BaseModel):
    caseId: str
    reportType: str
    title: str
    summary: str
    contents: Dict[str, str]
    issuedBy: str
    issuedAt: str

    model_config = ConfigDict(from_attributes=True)


class ReportCreate(ReportBase):
    pass


class ReportOut(ReportBase):
    id: UUID
    createdAt: str
    updatedAt: str

    model_config = ConfigDict(from_attributes=True)
