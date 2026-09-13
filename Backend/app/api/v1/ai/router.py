from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.auth import get_current_user, get_current_user_id, require_access_token
from app.models.case import Case
from app.models.user import User
from app.models.workflow import Workflow
from app.schemas.ai import (
    AIChatRequest,
    AIChatResponse,
    AIRecommendation,
    AISummary,
    MissingProcedure,
    ReadinessItem,
    ReadinessReport,
    RiskFactor,
    RiskReport,
)
from app.schemas.common import ApiResponse
from app.services.ai_copilot_service import (
    build_case_procedural_context,
    generate_copilot_response,
)
from app.services.dpog_service import DPOGEngine
from app.services import audit_chain_service

router = APIRouter()


async def _get_case_and_stages(case_id_str: str, db: AsyncSession):
    try:
        case_uuid = UUID(case_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid Case ID format.")
    
    case_res = await db.execute(select(Case).where(Case.id == case_uuid))
    case = case_res.scalars().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    stages_res = await db.execute(select(Workflow).where(Workflow.caseId == case_uuid).order_by(Workflow.order))
    stages = stages_res.scalars().all()
    return case, stages


@router.post("/chat", response_model=ApiResponse[AIChatResponse], dependencies=[Depends(require_access_token)])
async def chat(
    payload: AIChatRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """
    AI Procedural Copilot chat endpoint.
    Retrieves authorized case state, runs deterministic D-POG graph evaluation, builds
    structured context, and calls Gemini (with fallback to grounded rule-based engine).
    """
    user = None
    if user_id:
        try:
            user_res = await db.execute(select(User).where(User.id == UUID(user_id)))
            user = user_res.scalars().first()
        except Exception:
            pass

    # Determine case context
    case = None
    stages = []
    if payload.caseId:
        case, stages = await _get_case_and_stages(payload.caseId, db)
    else:
        # Fallback to first active case if none provided
        first_case_res = await db.execute(select(Case).order_by(Case.createdAt.desc()).limit(1))
        case = first_case_res.scalars().first()
        if case:
            stages_res = await db.execute(select(Workflow).where(Workflow.caseId == case.id).order_by(Workflow.order))
            stages = stages_res.scalars().all()

    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active case found for AI context.")

    # 1. Build deterministic D-POG structured context
    context = build_case_procedural_context(case=case, stages=stages, user=user)

    # 2. Call grounded Gemini Copilot (with deterministic D-POG fallback)
    copilot_result = await generate_copilot_response(
        case_context=context,
        user_message=payload.message,
        intent=payload.intent,
    )

    # Construct clean formatted text for standard chat view
    formatted_lines = [copilot_result.get("summary", "")]
    if copilot_result.get("observations"):
        formatted_lines.append("\n**Key Observations (D-POG State):**")
        for obs in copilot_result["observations"]:
            formatted_lines.append(f"- {obs}")
    if copilot_result.get("recommendations"):
        formatted_lines.append("\n**Operational Recommendations (Human Review Required):**")
        for rec in copilot_result["recommendations"]:
            formatted_lines.append(f"- {rec}")
    if copilot_result.get("basis"):
        formatted_lines.append(f"\n*Basis: {', '.join(copilot_result['basis'])}*")
    if copilot_result.get("uncertainties") and copilot_result["uncertainties"]:
        formatted_lines.append(f"*Uncertainties: {'; '.join(copilot_result['uncertainties'])}*")

    copilot_result["formattedText"] = "\n".join(formatted_lines)

    await audit_chain_service.create_audit_event(
        db,
        module="ai",
        action="AI_PROCEDURAL_QUERY",
        user=user.name if user else "Officer",
        user_role=user.role if user else "unknown",
        entity_id=None,
        case_id=case.id,
        details=f"Procedural copilot query: '{payload.message}'.",
        created_by=user.id if user else None
    )
    await db.commit()

    return {
        "success": True,
        "message": "AI Copilot analysis generated",
        "data": copilot_result,
    }


@router.get("/cases/{case_id}/summary", response_model=ApiResponse[AISummary], dependencies=[Depends(require_access_token)])
async def get_summary(case_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    case, stages = await _get_case_and_stages(case_id, db)
    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    dpog = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=stages)
    readiness = dpog.get("readiness", {})
    blockers = dpog.get("summary", {}).get("activeBlockers", [])
    actionable = dpog.get("summary", {}).get("nextActionable", [])

    pending_tasks = [a["title"] for a in actionable]
    delay_reasons = [f"{b['title']} is blocked by {b.get('rootBlocker', 'prerequisite')}" for b in blockers]

    summary_obj = AISummary(
        caseId=str(case.id),
        caseNumber=case.caseNumber,
        summary=f"Case {case.caseNumber} is at stage {case.currentStageOrder}/{case.totalStages} ({case.currentStage}) with {readiness.get('score', 0)}% procedural readiness.",
        currentStage=case.currentStage or "In Progress",
        investigationStatus="delayed" if blockers else ("completed" if readiness.get("score") == 100 else "on_track"),
        pendingTasks=pending_tasks if pending_tasks else ["Review case file"],
        missingDocuments=[f"Prerequisite for {b['title']}" for b in blockers],
        delayReasons=delay_reasons,
        suggestedNextStep=f"Progress '{actionable[0]['title']}'" if actionable else "Finalize court documentation.",
        generatedAt=datetime.now(timezone.utc).isoformat(),
    )
    return {"success": True, "message": "AI summary retrieved", "data": summary_obj}


@router.get("/cases/{case_id}/risk", response_model=ApiResponse[RiskReport], dependencies=[Depends(require_access_token)])
async def get_risk(case_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    case, stages = await _get_case_and_stages(case_id, db)
    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    dpog = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=stages)
    blockers = dpog.get("summary", {}).get("activeBlockers", [])
    readiness = dpog.get("readiness", {})

    risk_factors = []
    for b in blockers:
        risk_factors.append(RiskFactor(
            id=f"rf_{b['stageId']}",
            factor=f"Bottleneck at {b['title']}",
            impact="high" if b.get("affectedDownstreamCount", 0) > 1 else "medium",
            description=f"Blocked by {b.get('rootBlocker', 'pending lab/hospital obligations')}. Affects {b.get('affectedDownstreamCount', 0)} downstream steps."
        ))

    score = 30 + (len(blockers) * 20)
    score = min(95, max(15, score))
    level = "critical" if score >= 80 else ("high" if score >= 60 else ("medium" if score >= 40 else "low"))

    report = RiskReport(
        caseId=str(case.id),
        riskLevel=level,
        riskScore=score,
        riskFactors=risk_factors,
        summary=f"Procedural risk level is {level.upper()} due to {len(blockers)} active obligation bottlenecks.",
        generatedAt=datetime.now(timezone.utc).isoformat(),
    )
    return {"success": True, "message": "Risk report retrieved", "data": report}


@router.get("/cases/{case_id}/readiness", response_model=ApiResponse[ReadinessReport], dependencies=[Depends(require_access_token)])
async def get_readiness(case_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    case, stages = await _get_case_and_stages(case_id, db)
    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    dpog = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=stages)
    nodes = dpog.get("nodes", [])
    readiness = dpog.get("readiness", {})

    items = [
        ReadinessItem(
            id=n["stageId"],
            label=n["title"],
            done=n["isCompleted"],
            priority="required" if n.get("isCriticalPath", True) else "recommended",
            category="procedure" if "review" in n["title"].lower() else ("document" if "report" in n["title"].lower() or "fir" in n["title"].lower() else "evidence")
        )
        for n in nodes
    ]

    report = ReadinessReport(
        caseId=str(case.id),
        overallPercent=readiness.get("score", 0),
        completedCount=readiness.get("completedStages", 0),
        totalCount=readiness.get("totalStages", len(nodes)),
        items=items,
        recommendations=[f"Expedite {a['title']}" for a in dpog.get("summary", {}).get("nextActionable", [])],
        generatedAt=datetime.now(timezone.utc).isoformat(),
    )
    return {"success": True, "message": "Readiness report retrieved", "data": report}


@router.get("/cases/{case_id}/missing", response_model=ApiResponse[List[MissingProcedure]], dependencies=[Depends(require_access_token)])
async def get_missing(case_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    case, stages = await _get_case_and_stages(case_id, db)
    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    dpog = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=stages)
    blockers = dpog.get("summary", {}).get("activeBlockers", [])

    missing = []
    for i, b in enumerate(blockers):
        missing.append(MissingProcedure(
            id=f"mp_{b['stageId']}",
            type="missing_evidence" if "fsl" in b["title"].lower() or "forensic" in b["title"].lower() else "workflow_step",
            title=f"{b['title']} Incomplete",
            description=f"Prerequisite pending: {b.get('rootBlocker', 'External agency output missing')}",
            priority="critical" if b.get("affectedDownstreamCount", 0) > 1 else "high",
            suggestedAction=f"Coordinate with {b.get('department', 'external agency')} to resolve {b.get('rootBlocker')}.",
            daysOverdue=2,
            caseId=str(case.id),
        ))
    return {"success": True, "message": "Missing procedures retrieved", "data": missing}


@router.get("/cases/{case_id}/recommendations", response_model=ApiResponse[List[AIRecommendation]], dependencies=[Depends(require_access_token)])
async def get_recommendations(case_id: str, db: AsyncSession = Depends(get_db)) -> dict:
    case, stages = await _get_case_and_stages(case_id, db)
    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    dpog = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=stages)
    actionable = dpog.get("summary", {}).get("nextActionable", [])

    recs = []
    for i, a in enumerate(actionable):
        recs.append(AIRecommendation(
            id=f"ar_{a['stageId']}",
            title=f"Execute {a['title']}",
            description=f"All prerequisite obligations for '{a['title']}' are satisfied. Ready for operational execution.",
            priority="critical" if i == 0 else "high",
            category="procedure",
            suggestedAction=f"Assigned officer should complete {a['title']} obligations.",
            caseId=str(case.id),
            deadline=a.get("deadline"),
        ))
    return {"success": True, "message": "Recommendations retrieved", "data": recs}
