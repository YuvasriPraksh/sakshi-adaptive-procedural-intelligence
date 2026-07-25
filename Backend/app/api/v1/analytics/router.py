from typing import Any, Dict, List

from fastapi import APIRouter, Depends

from app.dependencies.auth import require_access_token
from app.schemas.common import ApiResponse
from app.schemas.analytics import (
    CrimeTypeData,
    DepartmentCaseCount,
    KpiStats,
    MonthlyTrendPoint,
    OfficerPerformance,
    RiskDist,
    StatusDist,
)

router = APIRouter()

KPI_STATS = KpiStats(
    totalCases=100,
    activeCases=53,
    closedCases=21,
    highRiskCases=18,
    avgInvestigationDays=19,
    pendingStages=47,
    slaCompliance=78,
    escalatedCases=8,
)

MONTHLY_TREND = [
    MonthlyTrendPoint(month="Aug", registered=62, resolved=48, escalated=4),
    MonthlyTrendPoint(month="Sep", registered=71, resolved=55, escalated=6),
    MonthlyTrendPoint(month="Oct", registered=84, resolved=61, escalated=5),
    MonthlyTrendPoint(month="Nov", registered=93, resolved=74, escalated=8),
    MonthlyTrendPoint(month="Dec", registered=102, resolved=82, escalated=7),
    MonthlyTrendPoint(month="Jan", registered=128, resolved=104, escalated=11),
    MonthlyTrendPoint(month="Feb", registered=134, resolved=119, escalated=9),
]

CRIME_TYPE_DATA = [
    CrimeTypeData(name="Sexual Assault", value=42),
    CrimeTypeData(name="Child Abuse", value=28),
    CrimeTypeData(name="Exploitation", value=14),
    CrimeTypeData(name="Trafficking", value=10),
    CrimeTypeData(name="Cybercrime", value=4),
    CrimeTypeData(name="Other", value=2),
]

STATUS_DIST = [
    StatusDist(label="In Progress", value=38, color="#3b82f6"),
    StatusDist(label="Pending", value=22, color="#f59e0b"),
    StatusDist(label="Under Review", value=15, color="#8b5cf6"),
    StatusDist(label="Completed", value=14, color="#10b981"),
    StatusDist(label="Escalated", value=7, color="#ef4444"),
    StatusDist(label="Closed", value=4, color="#64748b"),
]

RISK_DIST = [
    RiskDist(label="Critical", value=18, color="#dc2626"),
    RiskDist(label="High", value=31, color="#f59e0b"),
    RiskDist(label="Medium", value=34, color="#3b82f6"),
    RiskDist(label="Low", value=17, color="#10b981"),
]

OFFICER_PERF = [
    OfficerPerformance(name="SI Rajan K.", cases=8, resolved=5, avgDays=18),
    OfficerPerformance(name="SI Priya S.", cases=6, resolved=4, avgDays=22),
    OfficerPerformance(name="SI Amit V.", cases=5, resolved=5, avgDays=16),
    OfficerPerformance(name="DSP Kumar R.", cases=12, resolved=7, avgDays=14),
    OfficerPerformance(name="SI Deepa M.", cases=7, resolved=4, avgDays=20),
    OfficerPerformance(name="SI Rahul M.", cases=9, resolved=5, avgDays=19),
    OfficerPerformance(name="SI Kavitha N.", cases=4, resolved=3, avgDays=17),
]

DEPT_CASES = [
    DepartmentCaseCount(dept="Police", cases=348),
    DepartmentCaseCount(dept="Hospital", cases=214),
    DepartmentCaseCount(dept="FSL", cases=189),
    DepartmentCaseCount(dept="CWC", cases=156),
    DepartmentCaseCount(dept="Court", cases=89),
]

READINESS_DIST = [
    StatusDist(label="Not Ready (<40%)", value=28, color="#ef4444"),
    StatusDist(label="Partial (40-79%)", value=44, color="#f59e0b"),
    StatusDist(label="Ready (≥80%)", value=28, color="#10b981"),
]


@router.get("/kpis", response_model=ApiResponse[KpiStats], dependencies=[Depends(require_access_token)])
async def get_kpis() -> dict:
    return {"success": True, "message": "KPIs retrieved", "data": KPI_STATS}


@router.get("/monthly-trend", response_model=ApiResponse[List[MonthlyTrendPoint]], dependencies=[Depends(require_access_token)])
async def get_monthly_trend() -> dict:
    return {"success": True, "message": "Monthly trend retrieved", "data": MONTHLY_TREND}


@router.get("/crime-types", response_model=ApiResponse[List[CrimeTypeData]], dependencies=[Depends(require_access_token)])
async def get_crime_types() -> dict:
    return {"success": True, "message": "Crime type chart retrieved", "data": CRIME_TYPE_DATA}


@router.get("/status-dist", response_model=ApiResponse[List[StatusDist]], dependencies=[Depends(require_access_token)])
async def get_status_dist() -> dict:
    return {"success": True, "message": "Status distribution retrieved", "data": STATUS_DIST}


@router.get("/risk-dist", response_model=ApiResponse[List[RiskDist]], dependencies=[Depends(require_access_token)])
async def get_risk_dist() -> dict:
    return {"success": True, "message": "Risk distribution retrieved", "data": RISK_DIST}


@router.get("/officer-performance", response_model=ApiResponse[List[OfficerPerformance]], dependencies=[Depends(require_access_token)])
async def get_officer_perf() -> dict:
    return {"success": True, "message": "Officer performance retrieved", "data": OFFICER_PERF}


@router.get("/department-cases", response_model=ApiResponse[List[DepartmentCaseCount]], dependencies=[Depends(require_access_token)])
async def get_department_cases() -> dict:
    return {"success": True, "message": "Department case counts retrieved", "data": DEPT_CASES}


@router.get("/readiness-dist", response_model=ApiResponse[List[StatusDist]], dependencies=[Depends(require_access_token)])
async def get_readiness_dist() -> dict:
    return {"success": True, "message": "Readiness distribution retrieved", "data": READINESS_DIST}
