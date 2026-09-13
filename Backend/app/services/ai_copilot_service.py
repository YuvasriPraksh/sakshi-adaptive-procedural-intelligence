"""
ai_copilot_service.py — AI Procedural Copilot Service for SAKSHI.

Built strictly on top of the deterministic Dynamic Procedural Obligation Graph (D-POG).
Provides structured procedural context generation, Gemini API integration with strict
grounding guardrails, and deterministic fallback to prevent hallucinations.
"""
import json
import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

import httpx
from app.core.config import settings
from app.models.case import Case
from app.models.user import User
from app.models.workflow import Workflow
from app.services.dpog_service import DPOGEngine

logger = logging.getLogger("sakshi.ai_copilot")


SYSTEM_PROMPT = """You are the SAKSHI AI Procedural Copilot, an AI-assisted operational decision-support and procedural explanation assistant for sensitive pre-trial criminal investigations under Indian Law (such as POCSO).

CORE PRINCIPLES & GUARDRAILS:
1. SOURCE OF TRUTH: The provided Dynamic Procedural Obligation Graph (D-POG) state is the authoritative procedural truth. Never contradict or calculate procedural status independently.
2. STRICT GROUNDING: Ground all statements exclusively in the provided structured case context. NEVER invent, hallucinate, or extrapolate facts, evidence, obligations, deadlines, or witness statements that are not explicitly present in the context.
3. EXPLICIT UNAVAILABILITY: If a user asks about events, evidence, witness statements, or records not present in the provided case context, you MUST explicitly state that the information is unavailable in the authorized case record.
4. OPERATIONAL ONLY (NO LEGAL/JUDICIAL DETERMINATIONS): You are an operational workflow assistant. You must NEVER determine guilt or innocence, assess witness credibility, recommend arrest/bail/sentencing, or provide authoritative legal conclusions. If prompted for legal advice or guilt determination, refuse politely and state that SAKSHI provides procedural and operational support only.
5. OPERATIONAL RECOMMENDATIONS: All recommendations must be framed as suggestions for human review. Never command autonomous actions or claim legal authority.
6. STRUCTURED EXPLANATION: Clearly distinguish:
   - OBSERVATIONS: Direct facts from the current D-POG state.
   - RECOMMENDATIONS: Operational next steps based on actionable stages.
   - BASIS: The specific D-POG nodes, dependencies, or statutory rules supporting the analysis.
   - UNCERTAINTIES: Missing information, pending external lab reports, or unverified documents.

OUTPUT FORMAT:
Respond with a valid JSON object with the following keys:
{
  "summary": "Concise 1-2 sentence overview of current procedural state and answer.",
  "observations": ["Factual bullet point 1 from D-POG", "Factual bullet point 2 from D-POG"],
  "recommendations": ["Suggested operational action 1", "Suggested operational action 2"],
  "basis": ["D-POG node or prerequisite rule supporting this", "Statutory milestone reference"],
  "uncertainties": ["Missing information or pending external item if any"],
  "missingInformation": ["Specific missing report, evidence item, or uncompleted prerequisite"],
  "humanApprovalRequired": true
}
Ensure the response is strictly valid JSON without wrapping markdown code fences if possible.
"""


def build_case_procedural_context(case: Case, stages: List[Workflow], user: Optional[User] = None) -> Dict[str, Any]:
    """
    Construct a deterministic, pseudonymous, and structured AI context from live PostgreSQL records and D-POG.
    Never includes raw personal identifiers, passwords, or system secrets.
    """
    engine = DPOGEngine(crime_type=case.crimeType or "POCSO")
    dpog_result = engine.evaluate_graph(case_id=str(case.id), case_number=case.caseNumber, db_stages=stages)

    # Summarize nodes cleanly
    nodes_summary = []
    for node in dpog_result.get("nodes", []):
        nodes_summary.append({
            "stageId": node["stageId"],
            "order": node["order"],
            "title": node["title"],
            "department": node["department"],
            "responsibleRole": node["responsibleRole"],
            "calculatedStatus": node["calculatedStatus"],
            "deadline": node.get("deadline"),
            "statutoryDeadlineLabel": node.get("statutoryDeadlineLabel"),
            "prerequisites": node.get("prerequisites", []),
            "incompletePrerequisites": node.get("incompletePrerequisites", []),
            "isBlocked": node.get("isBlocked", False),
            "isActionable": node.get("isActionable", False),
            "rootBlocker": node.get("rootBlockerInfo", {}).get("rootBlockerTitle") if node.get("rootBlockerInfo") else None,
            "downstreamAffectedCount": node.get("downstreamImpactInfo", {}).get("totalAffectedCount", 0),
        })

    # Identify missing or pending evidence/prerequisites
    missing_items = []
    for node in dpog_result.get("nodes", []):
        if node.get("isBlocked"):
            missing_items.append(f"Prerequisite pending for '{node['title']}': {', '.join(node.get('incompletePrerequisites', []))}")
        elif node.get("calculatedStatus") == "IN_PROGRESS":
            missing_items.append(f"In-progress obligation awaiting completion: '{node['title']}' ({node['department'].upper()})")

    context = {
        "caseIdentifier": {
            "caseId": str(case.id),
            "caseNumber": case.caseNumber,
            "crimeType": case.crimeType or "POCSO",
            "victimCode": case.victimCode or f"VIC-{case.caseNumber.split('/')[-1]}",
            "district": case.district or "Unknown",
            "state": case.state or "State",
            "priority": case.priority,
            "status": case.status,
            "currentStage": case.currentStage,
            "currentStageOrder": case.currentStageOrder,
            "totalStages": case.totalStages,
        },
        "dpogReadiness": dpog_result.get("readiness", {}),
        "activeBlockers": dpog_result.get("summary", {}).get("activeBlockers", []),
        "nextActionableSteps": dpog_result.get("summary", {}).get("nextActionable", []),
        "isProcedurallyIntact": dpog_result.get("summary", {}).get("isProcedurallyIntact", False),
        "workflowNodes": nodes_summary,
        "missingOrPendingItems": missing_items,
        "statutoryMilestones": [
            {"milestone": "Medical Examination", "timeline": "Mandatory within 24 hours under POCSO Sec 27", "stage": "stage_3"},
            {"milestone": "Statutory Final Report / Chargesheet", "timeline": "Mandatory within 60 days under POCSO Sec 35", "stage": "stage_9"},
        ],
        "requestingUser": {
            "role": user.role if user else "officer",
            "name": user.name if user else "Investigating Officer",
        } if user else None,
    }

    return context


def _generate_deterministic_fallback(context: Dict[str, Any], user_message: str, intent: Optional[str] = None) -> Dict[str, Any]:
    """
    Deterministic rule-based procedural copilot engine.
    Ensures 100% grounded and reliable responses even if Gemini API is unreachable or unconfigured.
    """
    msg_lower = user_message.lower()
    case_info = context.get("caseIdentifier", {})
    readiness = context.get("dpogReadiness", {})
    blockers = context.get("activeBlockers", [])
    actionable = context.get("nextActionableSteps", [])
    nodes = context.get("workflowNodes", [])
    missing = context.get("missingOrPendingItems", [])

    # Guardrail Check for out-of-scope / judicial questions
    out_of_scope_keywords = ["who is guilty", "is the accused guilty", "guilty or innocent", "credibility", "should we arrest", "grant bail", "sentence length"]
    if any(k in msg_lower for k in out_of_scope_keywords):
        return {
            "summary": "SAKSHI is an operational and procedural decision-support system. It does not assess guilt, determine witness credibility, or recommend judicial outcomes such as arrest, bail, or sentencing.",
            "observations": [
                f"Active case {case_info.get('caseNumber', '')} is currently in procedural stage {case_info.get('currentStageOrder', '')} of {case_info.get('totalStages', '')}.",
                "All case assessments are restricted to procedural compliance, obligation dependencies, and statutory timelines."
            ],
            "recommendations": [
                "Refer investigative findings to the public prosecutor and competent judicial magistrate for legal determinations.",
                "Ensure all mandatory procedural obligations are completed to preserve evidence integrity."
            ],
            "basis": ["SAKSHI Operational Mandate", "POCSO Procedural Guidelines"],
            "uncertainties": ["Judicial and evidentiary credibility evaluations are strictly reserved for human authorities."],
            "missingInformation": [],
            "humanApprovalRequired": True,
        }

    # Blocker analysis query (e.g. "Why is Evidence Review blocked?")
    if "blocked" in msg_lower or "blocker" in msg_lower or "why is" in msg_lower or intent == "explain_blocker":
        # Check if a specific stage was asked about
        target_node = None
        for n in nodes:
            if n["title"].lower() in msg_lower or n["stageId"].lower() in msg_lower:
                target_node = n
                break

        if not target_node and blockers:
            # Pick first active blocker
            target_node_id = blockers[0]["stageId"]
            target_node = next((n for n in nodes if n["stageId"] == target_node_id), None)

        if target_node and target_node.get("isBlocked"):
            root_blocker_title = target_node.get("rootBlocker") or "Incomplete prerequisite obligations"
            incomplete_prereqs = target_node.get("incompletePrerequisites", [])
            affected_count = target_node.get("downstreamAffectedCount", 0)
            
            return {
                "summary": f"{target_node['title']} is currently BLOCKED. Root blocker: {root_blocker_title}.",
                "observations": [
                    f"Current status of '{target_node['title']}' is BLOCKED.",
                    f"Unfulfilled prerequisite obligations: {', '.join(incomplete_prereqs)}.",
                    f"This bottleneck impacts {affected_count} subsequent downstream obligations including the statutory chargesheet target."
                ],
                "recommendations": [
                    f"Coordinate with the responsible department for '{root_blocker_title}' to expedite completion.",
                    "Review intermediate evidence custody logs once the root blocker is resolved."
                ],
                "basis": [
                    f"D-POG graph traversal for node {target_node['stageId']}",
                    f"Prerequisite dependency rule: {target_node['stageId']} requires {incomplete_prereqs}"
                ],
                "uncertainties": [f"Timeline for completion of {root_blocker_title} depends on external lab/department throughput."],
                "missingInformation": [f"Pending completion of {root_blocker_title} ({', '.join(incomplete_prereqs)})"],
                "humanApprovalRequired": True,
            }
        elif target_node and not target_node.get("isBlocked"):
            return {
                "summary": f"'{target_node['title']}' is not blocked. Its current procedural status is {target_node['calculatedStatus']}.",
                "observations": [
                    f"Node '{target_node['title']}' has satisfied all prerequisite obligations.",
                    f"Current status: {target_node['calculatedStatus']} (Responsible: {target_node['department'].upper()})."
                ],
                "recommendations": [
                    f"Proceed with operational tasks for '{target_node['title']}'."
                ],
                "basis": [f"D-POG dependency status for {target_node['stageId']}"],
                "uncertainties": [],
                "missingInformation": [],
                "humanApprovalRequired": True,
            }

    # "What should happen next?" / Next steps
    if "next" in msg_lower or "should happen" in msg_lower or "what to do" in msg_lower or intent == "next_steps":
        actionable_titles = [f"{a['title']} ({a['department'].upper()})" for a in actionable]
        return {
            "summary": f"The next operational priority is to progress active and unblocked obligations: {', '.join(actionable_titles) if actionable_titles else 'All obligations completed'}.",
            "observations": [
                f"{len(actionable)} obligation(s) are currently actionable: {', '.join(actionable_titles)}.",
                f"Overall Procedural Readiness is {readiness.get('score', 0)}% ({readiness.get('status', 'ACTIVE')}).",
                f"{len(blockers)} downstream obligation(s) remain blocked awaiting prerequisite fulfillment."
            ],
            "recommendations": [
                f"Actionable Step: Focus operational resources on '{actionable[0]['title']}'." if actionable else "Review case file for final court readiness submission.",
                "Follow up with external stakeholders regarding pending reports before initiating evidence review."
            ],
            "basis": [
                "D-POG Next Actionable Queue",
                f"Readiness Score: {readiness.get('percentage', '0%')}"
            ],
            "uncertainties": ["External department turnaround time for pending laboratory analysis."],
            "missingInformation": missing[:3],
            "humanApprovalRequired": True,
        }

    # Missing information query
    if "missing" in msg_lower or intent == "missing_info":
        return {
            "summary": f"Identified {len(missing)} pending or missing procedural requirement(s) in case {case_info.get('caseNumber', '')}.",
            "observations": [
                f"Missing / Pending items: {'; '.join(missing) if missing else 'None. All prerequisites satisfied.'}",
                f"Active blockers currently recorded: {len(blockers)}."
            ],
            "recommendations": [
                "Request expedited submission of outstanding forensic/medical reports.",
                "Ensure verification documents are uploaded to case repository."
            ],
            "basis": ["D-POG Incomplete Prerequisite Audit", "PostgreSQL Workflow Stage Records"],
            "uncertainties": ["Verification status of unsubmitted external documentation."],
            "missingInformation": missing,
            "humanApprovalRequired": True,
        }

    # Deadline explanation query
    if "deadline" in msg_lower or "due" in msg_lower or "statutory" in msg_lower or intent == "deadline_risk":
        milestones = context.get("statutoryMilestones", [])
        return {
            "summary": f"Procedural tracking indicates statutory deadlines under POCSO: Medical Exam (24h) and Final Chargesheet (60 days).",
            "observations": [
                f"Statutory Milestone 1: {milestones[0]['milestone']} — {milestones[0]['timeline']}.",
                f"Statutory Milestone 2: {milestones[1]['milestone']} — {milestones[1]['timeline']}.",
                f"Current Readiness: {readiness.get('score', 0)}% with {len(blockers)} bottlenecked stage(s)."
            ],
            "recommendations": [
                "Monitor time elapsed since FIR registration to ensure 60-day investigation timeline is met.",
                "Expedite forensic lab analysis to avoid compression of the final review window."
            ],
            "basis": ["POCSO Act Section 27 & 35 Statutory Timelines", "D-POG Critical Path Analysis"],
            "uncertainties": ["Exact court submission scheduling depends on magistrate availability."],
            "missingInformation": missing[:2],
            "humanApprovalRequired": True,
        }

    # Hallucination / Unknown facts query check (e.g. "What did the witness say yesterday?")
    unknown_triggers = ["witness say", "confession", "secretly added", "suspect said", "phone call", "interrogation transcript"]
    if any(u in msg_lower for u in unknown_triggers):
        return {
            "summary": "The requested factual information or witness testimony is not available in the authorized D-POG case record.",
            "observations": [
                f"The authorized case record for {case_info.get('caseNumber', '')} contains structured procedural workflow nodes and metadata.",
                "Specific witness transcripts, informal interrogation notes, or unfiled statements are not present in the current procedural database."
            ],
            "recommendations": [
                "Verify whether physical case diaries (Section 172 CrPC / BNSS) contain the recorded statement.",
                "If a statement was recorded under Section 164 CrPC, ensure it is referenced in the Case Intake / Evidence Review stage."
            ],
            "basis": ["Case Context Boundary Check", "D-POG Record Verification"],
            "uncertainties": ["Information not present in authorized system context."],
            "missingInformation": ["Statement text not attached to digital case record."],
            "humanApprovalRequired": True,
        }

    # Default Case Summary
    completed_count = readiness.get("completedStages", 0)
    total_count = readiness.get("totalStages", len(nodes))
    return {
        "summary": f"Case {case_info.get('caseNumber', '')} is in procedural stage {case_info.get('currentStageOrder', 1)}/{total_count} ({case_info.get('currentStage', 'Active')}) with {readiness.get('score', 0)}% readiness.",
        "observations": [
            f"Procedural Status: {case_info.get('status', 'Active').upper()}.",
            f"Completed Obligations: {completed_count} of {total_count} stages completed.",
            f"Active Blockers: {len(blockers)} stage(s) blocked by prerequisite dependencies.",
            f"Actionable Next Steps: {len(actionable)} stage(s) ready for execution."
        ],
        "recommendations": [
            f"Prioritize resolving active blocker: '{blockers[0]['rootBlocker']}'." if blockers else "Proceed with actionable workflow obligations.",
            "Maintain chain-of-custody documentation across all evidence transfers."
        ],
        "basis": [
            f"D-POG State Evaluation for {case_info.get('caseNumber', 'Case')}",
            f"Readiness Indicator: {readiness.get('percentage', '0%')} ({readiness.get('status', 'ACTIVE')})"
        ],
        "uncertainties": ["External lab processing times may affect downstream schedule."],
        "missingInformation": missing[:3],
        "humanApprovalRequired": True,
    }


async def generate_copilot_response(
    case_context: Dict[str, Any],
    user_message: str,
    intent: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate a grounded AI response using Gemini 1.5 Flash API, falling back gracefully to deterministic logic.
    """
    api_key = settings.GEMINI_API_KEY.strip() if settings.GEMINI_API_KEY else ""

    # If no Gemini API key configured, use deterministic grounded fallback immediately
    if not api_key:
        logger.info("No GEMINI_API_KEY found. Using deterministic D-POG Copilot engine.")
        return _generate_deterministic_fallback(case_context, user_message, intent)

    # Call Gemini REST API via async httpx
    prompt_payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {
                        "text": f"{SYSTEM_PROMPT}\n\n"
                                f"STRUCTURED CASE CONTEXT (AUTHORITATIVE):\n"
                                f"{json.dumps(case_context, indent=2)}\n\n"
                                f"USER QUESTION / INTENT:\n"
                                f"Intent: {intent or 'general_query'}\n"
                                f"Message: {user_message}"
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,  # Low temperature for strict factual grounding
            "topP": 0.8,
            "maxOutputTokens": 1024,
            "responseMimeType": "application/json",
        }
    }

    gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"

    try:
        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.post(
                gemini_url,
                json=prompt_payload,
                headers={"Content-Type": "application/json"}
            )

        if response.status_code != 200:
            logger.warning(f"Gemini API returned status {response.status_code}: {response.text[:200]}. Falling back to deterministic D-POG.")
            return _generate_deterministic_fallback(case_context, user_message, intent)

        data = response.json()
        candidates = data.get("candidates", [])
        if not candidates:
            return _generate_deterministic_fallback(case_context, user_message, intent)

        text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
        if not text_content:
            return _generate_deterministic_fallback(case_context, user_message, intent)

        # Parse JSON
        parsed = json.loads(text_content)
        
        # Ensure mandatory keys exist
        return {
            "summary": parsed.get("summary", "Procedural analysis evaluated."),
            "observations": parsed.get("observations", []),
            "recommendations": parsed.get("recommendations", []),
            "basis": parsed.get("basis", ["Dynamic Procedural Obligation Graph"]),
            "uncertainties": parsed.get("uncertainties", []),
            "missingInformation": parsed.get("missingInformation", []),
            "humanApprovalRequired": True,
        }

    except Exception as exc:
        logger.warning(f"Gemini API invocation error: {str(exc)}. Falling back to deterministic D-POG engine.")
        return _generate_deterministic_fallback(case_context, user_message, intent)
