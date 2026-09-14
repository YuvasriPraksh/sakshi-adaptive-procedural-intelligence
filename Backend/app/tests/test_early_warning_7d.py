"""
test_early_warning_7d.py — Phase 7D: Procedural Early-Warning & Notification Intelligence tests.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional
import pytest
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.case import Case
from app.models.notification import Notification
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.services.early_warning_service import EarlyWarningService
from app.core.security import create_access_token, hash_password
from app.tests.conftest import pytestmark_db


class FakeAsyncSession:
    def __init__(self, existing_notifications=None):
        self.added = []
        self._existing = existing_notifications or []

    async def execute(self, stmt):
        items = self._existing
        try:
            compiled = stmt.compile()
            params = compiled.params
            # Look for eventCode parameter value
            req_code = None
            for k, v in params.items():
                if "event_code" in k.lower():
                    req_code = v
                    break
            if req_code is not None:
                items = [n for n in self._existing if n.eventCode == req_code]
        except Exception:
            pass

        class _Result:
            def __init__(self, res_items):
                self._items = res_items
            def scalars(self):
                return self
            def first(self):
                return self._items[0] if self._items else None
            def all(self):
                return self._items
        return _Result(items)

    def add(self, obj):
        self.added.append(obj)

    async def flush(self):
        pass


def _make_assessment(level: str, score: int, factors=None) -> RiskAssessment:
    return RiskAssessment(
        id=uuid.uuid4(),
        caseId=uuid.uuid4(),
        riskLevel=level,
        riskScore=score,
        riskFactors=factors or [],
        summary="Test assessment",
        generatedAt=datetime.now(timezone.utc).isoformat(),
    )


# ── Unit Tests ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_ew1_high_risk_trigger():
    """EW1: Becoming HIGH risk emits EARLY_WARN_HIGH_RISK notification."""
    db = FakeAsyncSession()
    case_id = uuid.uuid4()
    svc = EarlyWarningService()

    prev_risk = _make_assessment("LOW", 20)
    new_risk = _make_assessment("HIGH", 75)
    result = {"riskLevel": "HIGH", "riskScore": 75, "riskFactors": []}

    notifs = await svc.evaluate_and_emit(db, case_id, prev_risk, new_risk, result)
    codes = [n.eventCode for n in notifs]
    assert "EARLY_WARN_HIGH_RISK" in codes


@pytest.mark.asyncio
async def test_ew2_score_jump_trigger():
    """EW2: Score increase >= 15 pts emits EARLY_WARN_SCORE_JUMP notification."""
    db = FakeAsyncSession()
    case_id = uuid.uuid4()
    svc = EarlyWarningService()

    prev_risk = _make_assessment("MEDIUM", 40)
    new_risk = _make_assessment("MEDIUM", 60)
    result = {"riskLevel": "MEDIUM", "riskScore": 60, "riskFactors": []}

    notifs = await svc.evaluate_and_emit(db, case_id, prev_risk, new_risk, result)
    codes = [n.eventCode for n in notifs]
    assert "EARLY_WARN_SCORE_JUMP" in codes


@pytest.mark.asyncio
async def test_ew3_dependency_impact_trigger():
    """EW3: Non-zero dependency impact emits EARLY_WARN_DEPENDENCY_IMPACT notification."""
    db = FakeAsyncSession()
    case_id = uuid.uuid4()
    svc = EarlyWarningService()

    prev_risk = _make_assessment("LOW", 10)
    new_risk = _make_assessment("MEDIUM", 45)
    result = {
        "riskLevel": "MEDIUM",
        "riskScore": 45,
        "riskFactors": [{"id": "dependency", "factor": "Dependency", "impact": "30"}],
    }

    notifs = await svc.evaluate_and_emit(db, case_id, prev_risk, new_risk, result)
    codes = [n.eventCode for n in notifs]
    assert "EARLY_WARN_DEPENDENCY_IMPACT" in codes
    assert "EARLY_WARN_ROOT_BLOCKER" not in codes  # Renamed to DEPENDENCY_IMPACT


@pytest.mark.asyncio
async def test_ew3b_downstream_cascade_trigger():
    """EW3b: Dependency impact >= 50 emits EARLY_WARN_DOWNSTREAM_CASCADE notification."""
    db = FakeAsyncSession()
    case_id = uuid.uuid4()
    svc = EarlyWarningService()

    prev_risk = _make_assessment("LOW", 10)
    new_risk = _make_assessment("HIGH", 70)
    result = {
        "riskLevel": "HIGH",
        "riskScore": 70,
        "riskFactors": [{"id": "dependency", "factor": "Dependency", "impact": "65"}],
    }

    notifs = await svc.evaluate_and_emit(db, case_id, prev_risk, new_risk, result)
    codes = [n.eventCode for n in notifs]
    assert "EARLY_WARN_DOWNSTREAM_CASCADE" in codes


@pytest.mark.asyncio
async def test_ew4_deadline_triggers():
    """EW4: Deadline factor >= 75 emits OVERDUE; >= 40 emits NEAR."""
    db = FakeAsyncSession()
    case_id = uuid.uuid4()
    svc = EarlyWarningService()

    # Overdue
    notifs1 = await svc.evaluate_and_emit(
        db, case_id, _make_assessment("LOW", 10), _make_assessment("HIGH", 70),
        {"riskLevel": "HIGH", "riskScore": 70, "riskFactors": [{"id": "deadline", "factor": "Deadline", "impact": "85"}]}
    )
    assert "EARLY_WARN_DEADLINE_OVERDUE" in [n.eventCode for n in notifs1]

    # Near
    db2 = FakeAsyncSession()
    notifs2 = await svc.evaluate_and_emit(
        db2, case_id, _make_assessment("LOW", 10), _make_assessment("MEDIUM", 45),
        {"riskLevel": "MEDIUM", "riskScore": 45, "riskFactors": [{"id": "deadline", "factor": "Deadline", "impact": "50"}]}
    )
    assert "EARLY_WARN_DEADLINE_NEAR" in [n.eventCode for n in notifs2]


@pytest.mark.asyncio
async def test_ew5_workflow_stalled_trigger():
    """EW5: Stall factor >= 50 emits EARLY_WARN_WORKFLOW_STALLED."""
    db = FakeAsyncSession()
    case_id = uuid.uuid4()
    svc = EarlyWarningService()

    notifs = await svc.evaluate_and_emit(
        db, case_id, _make_assessment("LOW", 10), _make_assessment("MEDIUM", 50),
        {"riskLevel": "MEDIUM", "riskScore": 50, "riskFactors": [{"id": "stall", "factor": "Stall", "impact": "60"}]}
    )
    assert "EARLY_WARN_WORKFLOW_STALLED" in [n.eventCode for n in notifs]


@pytest.mark.asyncio
async def test_ew6_risk_resolved_trigger():
    """EW6: Risk dropping from HIGH/CRITICAL to LOW/MEDIUM emits EARLY_WARN_RISK_RESOLVED."""
    db = FakeAsyncSession()
    case_id = uuid.uuid4()
    svc = EarlyWarningService()

    notifs = await svc.evaluate_and_emit(
        db, case_id, _make_assessment("HIGH", 75), _make_assessment("LOW", 20),
        {"riskLevel": "LOW", "riskScore": 20, "riskFactors": []}
    )
    assert "EARLY_WARN_RISK_RESOLVED" in [n.eventCode for n in notifs]


@pytest.mark.asyncio
async def test_ew7_deduplication_different_event_codes():
    """EW7: 4-hour window suppresses same event code, but allows different event code."""
    case_id = uuid.uuid4()
    now = datetime.now(timezone.utc)

    # Existing notification for HIGH_RISK
    existing_notif = Notification(
        caseId=case_id,
        eventCode="EARLY_WARN_HIGH_RISK",
        createdAt=now - timedelta(hours=1),
    )

    db = FakeAsyncSession(existing_notifications=[existing_notif])
    svc = EarlyWarningService(now=now)

    prev_risk = _make_assessment("LOW", 20)
    new_risk = _make_assessment("HIGH", 80)
    result = {"riskLevel": "HIGH", "riskScore": 80, "riskFactors": []}

    notifs = await svc.evaluate_and_emit(db, case_id, prev_risk, new_risk, result)
    codes = [n.eventCode for n in notifs]

    # HIGH_RISK is suppressed by deduplication, but SCORE_JUMP (+60 pts) is NOT suppressed!
    assert "EARLY_WARN_HIGH_RISK" not in codes
    assert "EARLY_WARN_SCORE_JUMP" in codes


# ── Integration Tests (PostgreSQL required) ───────────────────────────────────

def _make_app_client(db_session: AsyncSession):
    from app.main import app
    from app.core.database import get_db

    async def _override_db():
        yield db_session

    app.dependency_overrides[get_db] = _override_db
    return httpx.AsyncClient(
        transport=httpx.ASGITransport(app=app),
        base_url="http://test",
    )


def _cleanup_overrides():
    from app.main import app
    app.dependency_overrides.clear()


def _make_case_kwargs(officer_id: uuid.UUID, suffix: str) -> dict:
    return dict(
        caseNumber=f"SAKSHI/7D/{suffix}",
        firNumber=f"FIR-7D-{suffix}",
        crimeType="POCSO",
        victimCode="V7D",
        victimAge=14,
        victimGender="Female",
        incidentDate="2024-01-01",
        incidentLocation="Test Location",
        district="Test District",
        state="Test State",
        assignedOfficerId=officer_id,
    )


@pytestmark_db
@pytest.mark.asyncio
async def test_i7d_early_warnings_authorization(db_session: AsyncSession, audit_test_user: User):
    """Integration: Case early warnings endpoint authorization checks."""
    # Create authorized case for audit_test_user
    case_auth = Case(**_make_case_kwargs(audit_test_user.id, "AUTH_OK"))
    # Create unauthorized case for another officer
    other_officer_id = uuid.uuid4()
    case_unauth = Case(**_make_case_kwargs(other_officer_id, "AUTH_DENIED"))

    db_session.add_all([case_auth, case_unauth])
    await db_session.flush()

    token_user = create_access_token(subject=str(audit_test_user.id))

    try:
        async with _make_app_client(db_session) as client:
            # 1. Authorized officer -> 200 OK
            res1 = await client.get(
                f"/api/v1/notifications/case/{case_auth.id}/early-warnings",
                headers={"Authorization": f"Bearer {token_user}"},
            )
            assert res1.status_code == 200, res1.text
            assert res1.json()["success"] is True

            # 2. Unauthorized officer -> 403 Forbidden
            res2 = await client.get(
                f"/api/v1/notifications/case/{case_unauth.id}/early-warnings",
                headers={"Authorization": f"Bearer {token_user}"},
            )
            assert res2.status_code == 403, res2.text

            # 3. Unauthenticated -> 401 Unauthorized
            res3 = await client.get(f"/api/v1/notifications/case/{case_auth.id}/early-warnings")
            assert res3.status_code == 401, res3.text

            # 4. Admin role -> 200 OK (bypass authorized)
            admin_user = User(
                id=uuid.uuid4(),
                email=f"admin7d-{uuid.uuid4().hex[:6]}@example.com",
                name="Admin 7D",
                role="admin",
                passwordHash=hash_password("admin-pw"),
            )
            db_session.add(admin_user)
            await db_session.flush()
            token_admin = create_access_token(subject=str(admin_user.id))

            res4 = await client.get(
                f"/api/v1/notifications/case/{case_unauth.id}/early-warnings",
                headers={"Authorization": f"Bearer {token_admin}"},
            )
            assert res4.status_code == 200, res4.text

    finally:
        _cleanup_overrides()
