from __future__ import annotations

from typing import List

from pydantic import BaseModel, ConfigDict


class KpiStats(BaseModel):
    totalCases: int
    activeCases: int
    closedCases: int
    highRiskCases: int
    avgInvestigationDays: int
    pendingStages: int
    slaCompliance: int
    escalatedCases: int

    model_config = ConfigDict(from_attributes=True)


class MonthlyTrendPoint(BaseModel):
    month: str
    registered: int
    resolved: int
    escalated: int

    model_config = ConfigDict(from_attributes=True)


class CrimeTypeData(BaseModel):
    name: str
    value: int

    model_config = ConfigDict(from_attributes=True)


class StatusDist(BaseModel):
    label: str
    value: int
    color: str

    model_config = ConfigDict(from_attributes=True)


class RiskDist(BaseModel):
    label: str
    value: int
    color: str

    model_config = ConfigDict(from_attributes=True)


class OfficerPerformance(BaseModel):
    name: str
    cases: int
    resolved: int
    avgDays: int

    model_config = ConfigDict(from_attributes=True)


class DepartmentCaseCount(BaseModel):
    dept: str
    cases: int

    model_config = ConfigDict(from_attributes=True)
