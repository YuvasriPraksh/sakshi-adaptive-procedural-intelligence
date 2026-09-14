import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.notification import Notification
from app.models.risk_assessment import RiskAssessment


class EarlyWarningService:
    """Evaluates early-warning event rules deterministically against risk assessment data

    and workflow metadata without modifying Phase 7A/7B risk engine logic.
    """

    DEDUPLICATION_WINDOW_HOURS = 4

    def __init__(self, now: Optional[datetime] = None):
        self.now = now or datetime.now(timezone.utc)

    async def _is_duplicate(self, db: AsyncSession, case_id: uuid.UUID, event_code: str) -> bool:
        """Check if an unread notification with the same case_id and event_code exists within the deduplication window."""
        window_start = self.now - timedelta(hours=self.DEDUPLICATION_WINDOW_HOURS)
        stmt = (
            select(Notification)
            .where(Notification.caseId == case_id)
            .where(Notification.eventCode == event_code)
            .where(Notification.createdAt >= window_start)
        )
        result = await db.execute(stmt)
        return result.scalars().first() is not None

    async def evaluate_and_emit(
        self,
        db: AsyncSession,
        case_id: uuid.UUID,
        prev_risk: Optional[RiskAssessment],
        new_risk: RiskAssessment,
        result: Dict[str, Any],
        performed_by: Optional[uuid.UUID] = None,
    ) -> List[Notification]:
        """Evaluate early warning triggers and persist non-duplicate notifications."""
        notifications_to_add: List[Notification] = []

        new_level = new_risk.riskLevel.upper()
        new_score = new_risk.riskScore
        prev_level = prev_risk.riskLevel.upper() if prev_risk else None
        prev_score = prev_risk.riskScore if prev_risk else None

        # Parse factors impact dictionary helper
        factors_by_id = {}
        for f in result.get("riskFactors", []):
            fid = f.get("id", "").lower()
            try:
                imp = float(f.get("impact", 0))
            except (ValueError, TypeError):
                imp = 0.0
            factors_by_id[fid] = imp

        # 1. EARLY_WARN_HIGH_RISK
        if new_level in ("HIGH", "CRITICAL") and (prev_level not in ("HIGH", "CRITICAL")):
            code = "EARLY_WARN_HIGH_RISK"
            if not await self._is_duplicate(db, case_id, code):
                priority = "critical" if new_level == "CRITICAL" else "high"
                notifications_to_add.append(
                    Notification(
                        type="early_warning",
                        category="early_warning",
                        eventCode=code,
                        title=f"Early Warning: Case Risk Reached {new_level}",
                        message=f"Procedural risk for case reached {new_level} level (score: {new_score}/100).",
                        priority=priority,
                        caseId=case_id,
                        caseNumber="",
                        actionUrl=f"/cases/{case_id}/risk",
                        detailsJson={
                            "eventCode": code,
                            "newLevel": new_level,
                            "newScore": new_score,
                            "prevLevel": prev_level,
                            "prevScore": prev_score,
                        },
                        createdBy=performed_by,
                    )
                )

        # 2. EARLY_WARN_SCORE_JUMP
        if prev_score is not None and (new_score - prev_score) >= 15:
            code = "EARLY_WARN_SCORE_JUMP"
            delta = new_score - prev_score
            if not await self._is_duplicate(db, case_id, code):
                notifications_to_add.append(
                    Notification(
                        type="early_warning",
                        category="early_warning",
                        eventCode=code,
                        title=f"Early Warning: Risk Score Jump (+{delta} pts)",
                        message=f"Procedural risk score jumped by +{delta} points (from {prev_score} to {new_score}).",
                        priority="high",
                        caseId=case_id,
                        caseNumber="",
                        actionUrl=f"/cases/{case_id}/risk",
                        detailsJson={
                            "eventCode": code,
                            "scoreDelta": delta,
                            "prevScore": prev_score,
                            "newScore": new_score,
                        },
                        createdBy=performed_by,
                    )
                )

        # 3. EARLY_WARN_DEPENDENCY_IMPACT & 4. EARLY_WARN_DOWNSTREAM_CASCADE
        dep_impact = factors_by_id.get("dependency", 0.0)
        if dep_impact >= 50.0:
            code = "EARLY_WARN_DOWNSTREAM_CASCADE"
            if not await self._is_duplicate(db, case_id, code):
                notifications_to_add.append(
                    Notification(
                        type="early_warning",
                        category="early_warning",
                        eventCode=code,
                        title="Early Warning: Multi-Stage Dependency Cascade",
                        message=f"Significant procedural dependency cascade impact detected ({int(dep_impact)}/100).",
                        priority="critical",
                        caseId=case_id,
                        caseNumber="",
                        actionUrl=f"/cases/{case_id}/risk",
                        detailsJson={
                            "eventCode": code,
                            "dependencyImpact": dep_impact,
                        },
                        createdBy=performed_by,
                    )
                )
        elif dep_impact > 0.0:
            code = "EARLY_WARN_DEPENDENCY_IMPACT"
            if not await self._is_duplicate(db, case_id, code):
                notifications_to_add.append(
                    Notification(
                        type="early_warning",
                        category="early_warning",
                        eventCode=code,
                        title="Early Warning: Dependency Impact Detected",
                        message=f"Procedural dependency impact identified ({int(dep_impact)}/100).",
                        priority="high",
                        caseId=case_id,
                        caseNumber="",
                        actionUrl=f"/cases/{case_id}/risk",
                        detailsJson={
                            "eventCode": code,
                            "dependencyImpact": dep_impact,
                        },
                        createdBy=performed_by,
                    )
                )

        # 5. EARLY_WARN_DEADLINE_OVERDUE & EARLY_WARN_DEADLINE_NEAR
        dl_impact = factors_by_id.get("deadline", 0.0)
        if dl_impact >= 75.0:
            code = "EARLY_WARN_DEADLINE_OVERDUE"
            if not await self._is_duplicate(db, case_id, code):
                notifications_to_add.append(
                    Notification(
                        type="early_warning",
                        category="early_warning",
                        eventCode=code,
                        title="Early Warning: High Deadline Risk",
                        message=f"Critical stage deadline procedural risk detected (deadline factor impact: {int(dl_impact)}/100).",
                        priority="high",
                        caseId=case_id,
                        caseNumber="",
                        actionUrl=f"/cases/{case_id}/risk",
                        detailsJson={
                            "eventCode": code,
                            "deadlineImpact": dl_impact,
                        },
                        createdBy=performed_by,
                    )
                )
        elif dl_impact >= 40.0:
            code = "EARLY_WARN_DEADLINE_NEAR"
            if not await self._is_duplicate(db, case_id, code):
                notifications_to_add.append(
                    Notification(
                        type="early_warning",
                        category="early_warning",
                        eventCode=code,
                        title="Early Warning: Approaching Deadline Risk",
                        message=f"Approaching stage deadline procedural risk detected (deadline factor impact: {int(dl_impact)}/100).",
                        priority="medium",
                        caseId=case_id,
                        caseNumber="",
                        actionUrl=f"/cases/{case_id}/risk",
                        detailsJson={
                            "eventCode": code,
                            "deadlineImpact": dl_impact,
                        },
                        createdBy=performed_by,
                    )
                )

        # 6. EARLY_WARN_WORKFLOW_STALLED
        stall_impact = factors_by_id.get("stall", 0.0)
        if stall_impact >= 50.0:
            code = "EARLY_WARN_WORKFLOW_STALLED"
            if not await self._is_duplicate(db, case_id, code):
                notifications_to_add.append(
                    Notification(
                        type="early_warning",
                        category="early_warning",
                        eventCode=code,
                        title="Early Warning: Workflow Stage Stalled",
                        message=f"Active stage has stalled with no activity (stall factor impact: {int(stall_impact)}/100).",
                        priority="medium",
                        caseId=case_id,
                        caseNumber="",
                        actionUrl=f"/cases/{case_id}/risk",
                        detailsJson={
                            "eventCode": code,
                            "stallImpact": stall_impact,
                        },
                        createdBy=performed_by,
                    )
                )

        # 7. EARLY_WARN_RISK_RESOLVED
        if prev_level in ("HIGH", "CRITICAL") and new_level in ("LOW", "MEDIUM"):
            code = "EARLY_WARN_RISK_RESOLVED"
            if not await self._is_duplicate(db, case_id, code):
                notifications_to_add.append(
                    Notification(
                        type="early_warning",
                        category="early_warning",
                        eventCode=code,
                        title=f"Risk Resolution: Risk Level Reduced to {new_level}",
                        message=f"Procedural risk reduced from {prev_level} to {new_level} (score: {new_score}/100).",
                        priority="low",
                        caseId=case_id,
                        caseNumber="",
                        actionUrl=f"/cases/{case_id}/risk",
                        detailsJson={
                            "eventCode": code,
                            "prevLevel": prev_level,
                            "newLevel": new_level,
                            "newScore": new_score,
                        },
                        createdBy=performed_by,
                    )
                )

        for notif in notifications_to_add:
            db.add(notif)

        return notifications_to_add
