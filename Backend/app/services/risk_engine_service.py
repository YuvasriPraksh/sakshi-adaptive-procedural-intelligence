import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List

from app.services.dpog_service import DPOGEngine
from sqlalchemy import select
from app.models.workflow import Workflow
from app.models.workflow_history import WorkflowHistory
from app.models.case import Case
from app.models.risk_assessment import RiskAssessment
import app.core.database as core_db

# Configuration constants (could be moved to config)
READINESS_WEIGHT = 0.35
DEADLINE_WEIGHT = 0.25
STALL_WEIGHT = 0.20
DEPENDENCY_WEIGHT = 0.20

DEFAULT_STALL_THRESHOLD_HOURS = 168  # 7 days

class RiskEngineService:
    """Deterministic procedural risk calculation engine.

    The engine aggregates four deterministic factors:
    - Readiness risk (inverse of procedural readiness score)
    - Deadline risk (based on proximity or overdue status)
    - Stall risk (inactivity in workflow history)
    - Dependency risk (root blocker impact from D‑POG)

    The final risk score is a weighted sum of the factors, rounded and clamped
    to 0‑100. The risk level categories are:
    0‑30 LOW, 31‑60 MEDIUM, 61‑85 HIGH, 86‑100 CRITICAL.
    """

    def __init__(self, now: Optional[datetime] = None):
        # Allow injection of current time for repeatable tests.
        self.now = now or datetime.now(timezone.utc)
        self.dpog_engine = DPOGEngine()

    # ---------------------------------------------------------------------
    # Public API
    # ---------------------------------------------------------------------
    async def calculate_risk_for_case(self, case_id: uuid.UUID) -> Dict[str, Any]:
        """Calculate the risk assessment for a given case.

        This method fetches required data from the database, runs the D‑POG
        engine, derives the deterministic factors, and returns a structured
        result ready to be persisted (but persistence is handled elsewhere).
        """
        async with core_db.async_session() as db:
            # Load case to ensure it exists
            case = await db.get(Case, case_id)
            if not case:
                raise ValueError(f"Case {case_id} not found")

            # Load workflow stages for the case
            workflow_stages: List[Workflow] = (
                await db.execute(
                    select(Workflow).where(Workflow.caseId == case_id)
                )
            ).scalars().all()

            # Load workflow history entries for the case (ordered newest first)
            history_entries: List[WorkflowHistory] = (
                await db.execute(
                    select(WorkflowHistory)
                    .where(WorkflowHistory.caseId == case_id)
                    .order_by(WorkflowHistory.changedAt.desc())
                )
            ).scalars().all()

            # Run D‑POG analysis – this is deterministic and explainable
            dpog_result = self.dpog_engine.evaluate_graph(
                case_id=str(case.id),
                case_number=case.caseNumber,
                db_stages=workflow_stages,
            )

            # Readiness risk (inverse of readiness score)
            readiness_score = dpog_result.get("readiness", {}).get("score", 0)
            readiness_risk = 100 - readiness_score

            # Deadline factor – use the *first* workflow stage that defines a deadline
            deadline_str = self._extract_deadline(workflow_stages)
            deadline_factor = self._calculate_deadline_factor(deadline_str)

            # Stall factor – based on latest history timestamp
            latest_change_str = history_entries[0].changedAt if history_entries else None
            stall_factor = self._calculate_stall_factor(latest_change_str)

            # Dependency factor – based on root blocker impact
            dependency_factor = self._calculate_dependency_factor(dpog_result)

            # Weighted raw score
            raw_score = (
                readiness_risk * READINESS_WEIGHT
                + deadline_factor * DEADLINE_WEIGHT
                + stall_factor * STALL_WEIGHT
                + dependency_factor * DEPENDENCY_WEIGHT
            )
            risk_score = max(0, min(100, int(raw_score + 0.5)))
            risk_level = self._categorise_risk(risk_score)

            # Build explanation
            explanation = (
                f"Readiness risk: {readiness_risk} (inverse of readiness score {readiness_score}). "
                f"Deadline factor: {deadline_factor}. "
                f"Stall factor: {stall_factor}. "
                f"Dependency factor: {dependency_factor}."
            )

            result = {
                "riskScore": risk_score,
                "riskLevel": risk_level,
                "readinessRisk": readiness_risk,
                "deadlineFactor": deadline_factor,
                "stallFactor": stall_factor,
                "dependencyFactor": dependency_factor,
                "riskFactors": [
                    {"id": "readiness", "factor": "Readiness", "impact": readiness_risk, "description": "Inverse of procedural readiness"},
                    {"id": "deadline", "factor": "Deadline", "impact": deadline_factor, "description": "Proximity or overdue of statutory deadline"},
                    {"id": "stall", "factor": "Stall", "impact": stall_factor, "description": "Inactivity in workflow history"},
                    {"id": "dependency", "factor": "Dependency", "impact": dependency_factor, "description": "Root blocker downstream impact"},
                ],
                "summary": explanation,
                "calculatedAt": self.now.isoformat(),
            }
            return result

    # ---------------------------------------------------------------------
    # Helper methods (deterministic and pure)
    # ---------------------------------------------------------------------
    def _extract_deadline(self, workflow_stages: List[Workflow]) -> Optional[str]:
        """Return the first non‑empty deadline string from the workflow stages.
        Handles objects that may not have a 'deadline' attribute gracefully.
        """
        for stage in workflow_stages:
            if hasattr(stage, "deadline") and stage.deadline:
                return stage.deadline
        return None

    def _calculate_deadline_factor(self, deadline_str: Optional[str]) -> int:
        """Calculate a 0‑100 deadline risk factor.
        """
        if not deadline_str:
            return 0
        try:
            deadline = datetime.fromisoformat(deadline_str)
            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)
        except Exception:
            return 0
        delta = deadline - self.now
        seconds = delta.total_seconds()
        if seconds < 0:
            overdue_hours = -seconds / 3600
            return min(100, int(overdue_hours * 10))
        hours_until = seconds / 3600
        if hours_until <= 24:
            return int(round((24 - hours_until) * (100 / 24)))
        return 0

    def _calculate_stall_factor(self, latest_change_str: Optional[str]) -> int:
        """Calculate stall risk based on inactivity.
        """
        if not latest_change_str:
            return 0
        try:
            latest = datetime.fromisoformat(latest_change_str)
            if latest.tzinfo is None:
                latest = latest.replace(tzinfo=timezone.utc)
        except Exception:
            return 0
        elapsed_hours = (self.now - latest).total_seconds() / 3600
        if elapsed_hours > DEFAULT_STALL_THRESHOLD_HOURS:
            return 100
        return 0

    def _calculate_dependency_factor(self, dpog_result: Dict[str, Any]) -> int:
        """Derive a dependency risk factor from D‑POG blocker analysis.
        """
        nodes = dpog_result.get("nodes", [])
        total_stages = len(nodes)
        if total_stages == 0:
            return 0
        for node in nodes:
            root_info = node.get("rootBlockerInfo")
            if root_info:
                affected = root_info.get("downstreamImpactCount", 0)
                return int(round((affected / total_stages) * 100))
        return 0

    def _categorise_risk(self, score: int) -> str:
        if score <= 30:
            return "LOW"
        if score <= 60:
            return "MEDIUM"
        if score <= 85:
            return "HIGH"
        return "CRITICAL"
