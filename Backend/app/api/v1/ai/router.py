from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.dependencies.auth import require_access_token
from app.schemas.ai import (
    AIRecommendation,
    AISummary,
    MissingProcedure,
    ReadinessItem,
    ReadinessReport,
    RiskFactor,
    RiskReport,
)
from app.schemas.common import ApiResponse

router = APIRouter()


def _mock_summary(case_id: str) -> AISummary:
    return AISummary(
        caseId=case_id,
        caseNumber=f"SAKSHI/{case_id[-6:].upper()}",
        summary="Investigation is progressing; forensic analysis and medical reports are pending.",
        currentStage="FSL Examination",
        investigationStatus="delayed",
        pendingTasks=["Submit FSL report", "Schedule witness interview", "Confirm victim statement"],
        missingDocuments=["Medical report", "Witness statement", "FSL chain-of-custody log"],
        delayReasons=["Forensic lab backlog", "Medical examiner availability"],
        suggestedNextStep="Coordinate with FSL and hospital to finalize evidence collection and prepare court brief.",
        generatedAt=datetime.utcnow().isoformat() + "Z",
    )


def _mock_risk(case_id: str) -> RiskReport:
    return RiskReport(
        caseId=case_id,
        riskLevel="high",
        riskScore=78,
        riskFactors=[
            RiskFactor(id="r1", factor="Delayed medical report", impact="high", description="Medical evidence is overdue."),
            RiskFactor(id="r2", factor="Chain-of-custody gaps", impact="medium", description="Some custody transfers lack verification records."),
        ],
        summary="This case has elevated risk due to evidence delays and missing forensic documentation.",
        generatedAt=datetime.utcnow().isoformat() + "Z",
    )


def _mock_readiness(case_id: str) -> ReadinessReport:
    return ReadinessReport(
        caseId=case_id,
        overallPercent=62,
        completedCount=8,
        totalCount=13,
        items=[
            ReadinessItem(id="rr1", label="FIR filed", done=True, priority="required", category="document"),
            ReadinessItem(id="rr2", label="Medical report", done=False, priority="required", category="document"),
            ReadinessItem(id="rr3", label="FSL report", done=False, priority="required", category="procedure"),
            ReadinessItem(id="rr4", label="Witness statement", done=False, priority="high", category="procedure"),
        ],
        recommendations=["Complete forensic report", "Confirm evidence transfer receipts", "Schedule court readiness review"],
        generatedAt=datetime.utcnow().isoformat() + "Z",
    )


def _mock_missing(case_id: str) -> List[MissingProcedure]:
    return [
        MissingProcedure(
            id="mp1",
            type="missing_document",
            title="Medical report missing",
            description="The medical examination report has not been attached to the case file.",
            priority="critical",
            suggestedAction="Obtain and upload the medical examination report immediately.",
            daysOverdue=3,
            caseId=case_id,
        ),
        MissingProcedure(
            id="mp2",
            type="workflow_step",
            title="Witness interview pending",
            description="Scheduled witness interview has not been completed.",
            priority="high",
            suggestedAction="Assign a field investigator to complete the witness interview.",
            daysOverdue=2,
            caseId=case_id,
        ),
    ]


def _mock_recommendations(case_id: str) -> List[AIRecommendation]:
    return [
        AIRecommendation(
            id="ar1",
            title="Secure FSL report",
            description="Ensure FSL evidence analysis report is shared with the prosecution team.",
            priority="critical",
            category="procedure",
            suggestedAction="Expedite FSL analysis and attach the report to the case file.",
            caseId=case_id,
            deadline=(datetime.utcnow().isoformat() + "Z"),
        ),
        AIRecommendation(
            id="ar2",
            title="Verify witness availability",
            description="Confirm witness availability for the next court hearing preparation.",
            priority="high",
            category="coordination",
            suggestedAction="Contact the witness and schedule a short availability check-in.",
            caseId=case_id,
        ),
    ]


@router.get("/cases/{case_id}/summary", response_model=ApiResponse[AISummary], dependencies=[Depends(require_access_token)])
async def get_summary(case_id: str) -> dict:
    return {"success": True, "message": "AI summary retrieved", "data": _mock_summary(case_id)}


@router.get("/cases/{case_id}/risk", response_model=ApiResponse[RiskReport], dependencies=[Depends(require_access_token)])
async def get_risk(case_id: str) -> dict:
    return {"success": True, "message": "Risk report retrieved", "data": _mock_risk(case_id)}


@router.get("/cases/{case_id}/readiness", response_model=ApiResponse[ReadinessReport], dependencies=[Depends(require_access_token)])
async def get_readiness(case_id: str) -> dict:
    return {"success": True, "message": "Readiness report retrieved", "data": _mock_readiness(case_id)}


@router.get("/cases/{case_id}/missing", response_model=ApiResponse[List[MissingProcedure]], dependencies=[Depends(require_access_token)])
async def get_missing(case_id: str) -> dict:
    return {"success": True, "message": "Missing procedures retrieved", "data": _mock_missing(case_id)}


@router.get("/cases/{case_id}/recommendations", response_model=ApiResponse[List[AIRecommendation]], dependencies=[Depends(require_access_token)])
async def get_recommendations(case_id: str) -> dict:
    return {"success": True, "message": "Recommendations retrieved", "data": _mock_recommendations(case_id)}


class ChatRequest(BaseModel):
    message: str
    caseId: Optional[str] = None


@router.post("/chat", response_model=ApiResponse[str], dependencies=[Depends(require_access_token)])
async def chat(payload: ChatRequest) -> dict:
    prompt = payload.message.lower()
    if "summary" in prompt:
        response = "The case is currently delayed due to pending forensic evidence and requires coordinated action across police and hospital teams."
    elif "risk" in prompt:
        response = "Current risk is high because several deadlines have been missed and evidence integrity needs verification."
    elif "readiness" in prompt:
        response = "The case is 62% ready for court; final reports and witness statements remain outstanding."
    elif "missing" in prompt:
        response = "Key missing items include medical report, FSL chain-of-custody log, and witness interview notes."
    else:
        response = "I recommend reviewing forensic timelines, confirming evidence custody, and ensuring medical documentation is attached."
    return {"success": True, "message": "AI response generated", "data": response}
