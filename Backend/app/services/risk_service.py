import uuid
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

from app.services.risk_engine_service import RiskEngineService
from app.services.audit_chain_service import create_audit_event
from app.services.early_warning_service import EarlyWarningService
from app.models.risk_assessment import RiskAssessment
from app.models.notification import Notification
from app.core.database import async_session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


class RiskService:
    """Orchestrates risk computation, persistence, audit logging and notification.

    This class is deliberately thin – it delegates deterministic calculation to
    :class:`RiskEngineService` and focuses on side-effects (DB persistence,
    audit chain entry, notification deduplication).
    """

    def __init__(self, now: Optional[datetime] = None):
        self.now = now or datetime.now(timezone.utc)
        self.engine = RiskEngineService(now=self.now)

    # ------------------------------------------------------------------
    # LEVEL MAP — deterministic elevation comparison
    # LOW=1, MEDIUM=2, HIGH=3, CRITICAL=4
    # A new assessment is "elevated" iff new_lvl > old_lvl (strictly).
    # ------------------------------------------------------------------
    _LEVEL_MAP = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 4}

    def _is_elevated(self, old_level: str, old_score: int, new_level: str, new_score: int) -> bool:
        """Return True iff new risk is strictly higher than old risk (level or score)."""
        old_lvl = self._LEVEL_MAP.get(old_level.upper(), 0)
        new_lvl = self._LEVEL_MAP.get(new_level.upper(), 0)
        if new_lvl > old_lvl:
            return True
        if new_lvl == old_lvl and new_score > old_score:
            return True
        return False

    def _build_assessment(
        self, case_id: uuid.UUID, result: Dict[str, Any], performed_by: Optional[uuid.UUID]
    ) -> RiskAssessment:
        return RiskAssessment(
            caseId=case_id,
            riskLevel=result["riskLevel"],
            riskScore=result["riskScore"],
            riskFactors=result["riskFactors"],
            summary=result["summary"],
            generatedAt=result["calculatedAt"],
            createdBy=performed_by,
            updatedBy=performed_by,
        )

    async def _emit_audit_and_notification(
        self,
        db: AsyncSession,
        case_id: uuid.UUID,
        risk_item: RiskAssessment,
        prev_risk: Optional[RiskAssessment],
        result: Dict[str, Any],
        performed_by: Optional[uuid.UUID],
    ) -> None:
        """Shared side-effect logic: audit events + notification deduplication."""
        user_str = str(performed_by) if performed_by else "system"

        # Audit: compute event
        await create_audit_event(
            db,
            module="risk",
            action="compute",
            user=user_str,
            user_role="system",
            entity_id=str(risk_item.id),
            case_id=case_id,
            details=str(result),
            ip_address=None,
            status="success",
            created_by=performed_by,
        )

        # RISK_ELEVATED — only if new level strictly higher than previous
        if prev_risk and self._is_elevated(prev_risk.riskLevel, prev_risk.riskScore, result["riskLevel"], result["riskScore"]):
            await create_audit_event(
                db,
                module="risk",
                action="RISK_ELEVATED",
                user=user_str,
                user_role="system",
                entity_id=str(risk_item.id),
                case_id=case_id,
                details=f"Risk elevated from {prev_risk.riskLevel} to {result['riskLevel']}",
                ip_address=None,
                status="success",
                created_by=performed_by,
            )

        # Notification deduplication: skip if same type+case within 1 hour
        one_hour_ago = self.now - timedelta(hours=1)
        recent = await db.execute(
            select(Notification)
            .where(Notification.type == "risk")
            .where(Notification.caseId == case_id)
            .where(Notification.createdAt >= one_hour_ago)
        )
        if not recent.scalars().first():
            notif = Notification(
                type="risk",
                category="risk",
                title=f"Risk assessment {result['riskLevel']}",
                message=result["summary"],
                priority="high" if result["riskLevel"] in ("HIGH", "CRITICAL") else "medium",
                caseId=case_id,
                caseNumber="",
                actionUrl=f"/cases/{case_id}/risk",
                createdBy=performed_by,
            )
            db.add(notif)

        # Phase 7D Procedural Early Warning Engine Evaluation
        early_warning_svc = EarlyWarningService(now=self.now)
        await early_warning_svc.evaluate_and_emit(
            db, case_id, prev_risk, risk_item, result, performed_by
        )

    async def compute_and_persist(
        self, case_id: uuid.UUID, performed_by: Optional[uuid.UUID] = None
    ) -> Dict[str, Any]:
        """Compute risk for *case_id*, store the result and emit audit/notification.

        Uses an internal async_session (production path).
        Returns the computed result dict.
        """
        result = await self.engine.calculate_risk_for_case(case_id)
        risk_item = self._build_assessment(case_id, result, performed_by)

        async with async_session() as db:
            # Retrieve previous assessment BEFORE adding the new one
            prev_res = await db.execute(
                select(RiskAssessment)
                .where(RiskAssessment.caseId == case_id)
                .order_by(RiskAssessment.createdAt.desc())
                .limit(1)
            )
            prev_risk = prev_res.scalars().first()

            db.add(risk_item)
            await db.flush()  # obtain PK for audit event

            await self._emit_audit_and_notification(
                db, case_id, risk_item, prev_risk, result, performed_by
            )
            await db.commit()

        return result

    async def compute_and_persist_with_db(
        self,
        case_id: uuid.UUID,
        db: AsyncSession,
        performed_by: Optional[uuid.UUID] = None,
    ) -> Dict[str, Any]:
        """Same as compute_and_persist but uses an injected AsyncSession.

        Intended for integration tests that need to control the session
        lifecycle (e.g., wrap in a rolled-back transaction).
        Does NOT call db.commit() — the caller controls transaction lifecycle.
        """
        result = await self.engine.calculate_risk_for_case(case_id)
        risk_item = self._build_assessment(case_id, result, performed_by)

        # Retrieve previous assessment BEFORE adding the new one
        prev_res = await db.execute(
            select(RiskAssessment)
            .where(RiskAssessment.caseId == case_id)
            .order_by(RiskAssessment.createdAt.desc())
            .limit(1)
        )
        prev_risk = prev_res.scalars().first()

        db.add(risk_item)
        await db.flush()  # obtain PK for audit event

        await self._emit_audit_and_notification(
            db, case_id, risk_item, prev_risk, result, performed_by
        )
        await db.flush()

        return result
