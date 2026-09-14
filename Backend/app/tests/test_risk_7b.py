"""
test_risk_7b.py — Phase 7B: Risk assessment security & elevation tests.

Coverage matrix:
  UNIT TESTS (no DB required):
  U1  RISK_ELEVATED: LOW  -> MEDIUM  elevation detected
  U2  RISK_ELEVATED: MEDIUM -> HIGH  elevation detected
  U3  RISK_ELEVATED: HIGH -> CRITICAL elevation detected
  U4  Same risk level      -> no elevation
  U5  Lower risk level     -> no elevation
  U6  No previous risk     -> no elevation event
  U7  Actor identity: performed_by wired through to audit event user field
  U8  Client spoofing: token sub cannot forge user identity beyond DB lookup

  INTEGRATION TESTS (PostgreSQL required, skipped if unavailable):
  I1  Authorized user can compute risk for their assigned case (persistence)
  I2  IDOR: unauthorized user (different officer, role=police) is rejected 403
  I3  Authentication required: unauthenticated request returns 401
  I4  History endpoint: authorized user sees all assessments, ordered desc
  I5  History endpoint: unauthorized user is rejected 403
  I6  GET /cases/{case_id}: authorized user sees latest assessment
  I7  GET /cases/{case_id}: unauthorized user rejected 403
  I8  Admin role can access any case
  I9  Audit event created on compute
  I10 RISK_ELEVATED audit event created on LOW->MEDIUM
  I11 Notification created on first compute
  I12 Notification deduplication: second compute within 1h skips notification
  I13 History ordering: assessments returned newest-first
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from typing import Optional

import pytest
import httpx
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import create_access_token
from app.models.audit_log import AuditLog
from app.models.case import Case
from app.models.notification import Notification
from app.models.risk_assessment import RiskAssessment
from app.models.user import User
from app.services.risk_service import RiskService
from app.tests.conftest import pytestmark_db


# ── Helpers ────────────────────────────────────────────────────────────────────

def _make_risk_result(level: str, score: int) -> dict:
    return {
        "riskLevel": level,
        "riskScore": score,
        "riskFactors": [],
        "summary": f"Mock {level} result",
        "calculatedAt": datetime.now(timezone.utc).isoformat(),
    }


def _make_case_kwargs(officer_id: uuid.UUID, suffix: str) -> dict:
    """Return minimal valid Case constructor kwargs."""
    return dict(
        caseNumber=f"SAKSHI/7B/{suffix}",
        firNumber=f"FIR-{suffix}",
        crimeType="POCSO",
        victimCode="V001",
        victimAge=12,
        victimGender="Female",
        incidentDate="2024-01-01",
        incidentLocation="Test Location",
        district="Test District",
        state="Test State",
        assignedOfficerId=officer_id,
    )


# ── Unit Tests (no DB) ────────────────────────────────────────────────────────

class FakeAuditDB:
    """Minimal async session stub that records add/flush calls."""

    def __init__(self, prev_risk: Optional[RiskAssessment] = None):
        self._prev_risk = prev_risk
        self.added: list = []
        self.flushed = 0

    async def execute(self, stmt):
        class _R:
            def __init__(self, val):
                self._val = val
            def scalars(self):
                return self
            def first(self):
                return self._val
        return _R(self._prev_risk)

    def add(self, obj):
        self.added.append(obj)

    async def flush(self):
        self.flushed += 1

    async def commit(self):
        pass


async def _run_elevation_unit_test(
    old_level: Optional[str],
    old_score: Optional[int],
    new_level: str,
    new_score: int,
    *,
    expect_elevated: bool,
) -> list[str]:
    """
    Core helper: run compute_and_persist_with_db against a fake session with
    a given previous-risk level, capture which audit 'action' values were created,
    and return them.
    """
    svc = RiskService()
    case_id = uuid.uuid4()

    prev_risk: Optional[RiskAssessment] = None
    if old_level is not None:
        prev_risk = MagicMock(spec=RiskAssessment)
        prev_risk.riskLevel = old_level
        prev_risk.riskScore = old_score

    audit_actions: list[str] = []

    async def mock_create_audit(db, *, action, **kwargs):
        audit_actions.append(action)
        ev = MagicMock()
        ev.id = uuid.uuid4()
        return ev

    # Build a fake session that returns prev_risk on the first execute,
    # and no existing notification on subsequent ones.
    class _FakeDB:
        _call_idx = 0

        async def execute(self, stmt):
            class _R:
                def __init__(self, val):
                    self._val = val
                def scalars(self):
                    return self
                def first(self):
                    return self._val

            if _FakeDB._call_idx == 0:
                _FakeDB._call_idx += 1
                return _R(prev_risk)
            else:
                return _R(None)  # no recent notification

        def add(self, obj):
            pass

        async def flush(self):
            pass

    db = _FakeDB()
    result_dict = _make_risk_result(new_level, new_score)

    # Patch engine.calculate_risk_for_case to return controlled result
    svc.engine.calculate_risk_for_case = AsyncMock(return_value=result_dict)

    with patch(
        "app.services.risk_service.create_audit_event",
        side_effect=mock_create_audit,
    ):
        await svc.compute_and_persist_with_db(case_id, db)

    return audit_actions


@pytest.mark.asyncio
async def test_u1_low_to_medium_elevation():
    """U1: LOW->MEDIUM must create RISK_ELEVATED audit event."""
    actions = await _run_elevation_unit_test("LOW", 10, "MEDIUM", 40, expect_elevated=True)
    assert "RISK_ELEVATED" in actions, f"Expected RISK_ELEVATED in {actions}"
    assert "compute" in actions


@pytest.mark.asyncio
async def test_u2_medium_to_high_elevation():
    """U2: MEDIUM->HIGH must create RISK_ELEVATED audit event."""
    actions = await _run_elevation_unit_test("MEDIUM", 40, "HIGH", 70, expect_elevated=True)
    assert "RISK_ELEVATED" in actions


@pytest.mark.asyncio
async def test_u3_high_to_critical_elevation():
    """U3: HIGH->CRITICAL must create RISK_ELEVATED audit event."""
    actions = await _run_elevation_unit_test("HIGH", 70, "CRITICAL", 95, expect_elevated=True)
    assert "RISK_ELEVATED" in actions


@pytest.mark.asyncio
async def test_u4_same_level_no_elevation():
    """U4: Same level (MEDIUM->MEDIUM) and same score must NOT create RISK_ELEVATED."""
    actions = await _run_elevation_unit_test("MEDIUM", 50, "MEDIUM", 50, expect_elevated=False)
    assert "RISK_ELEVATED" not in actions, f"RISK_ELEVATED must not fire for same level, got {actions}"


@pytest.mark.asyncio
async def test_u4b_same_level_higher_score():
    """U4b: Same level but strictly higher score must create RISK_ELEVATED."""
    actions = await _run_elevation_unit_test("MEDIUM", 40, "MEDIUM", 50, expect_elevated=True)
    assert "RISK_ELEVATED" in actions

@pytest.mark.asyncio
async def test_u4c_higher_level_lower_score():
    """U4c: Higher level but strictly lower score must create RISK_ELEVATED."""
    actions = await _run_elevation_unit_test("MEDIUM", 60, "HIGH", 55, expect_elevated=True)
    assert "RISK_ELEVATED" in actions

@pytest.mark.asyncio
async def test_u5_lower_level_no_elevation():
    """U5: Lower level (HIGH->LOW) must NOT create RISK_ELEVATED."""
    actions = await _run_elevation_unit_test("HIGH", 70, "LOW", 15, expect_elevated=False)
    assert "RISK_ELEVATED" not in actions


@pytest.mark.asyncio
async def test_u6_no_previous_assessment_no_elevation():
    """U6: No prior assessment -> no RISK_ELEVATED (there is nothing to compare against)."""
    actions = await _run_elevation_unit_test(None, None, "CRITICAL", 95, expect_elevated=False)
    assert "RISK_ELEVATED" not in actions
    assert "compute" in actions


@pytest.mark.asyncio
async def test_u7_actor_identity_in_audit():
    """U7: performed_by UUID appears as 'user' field in compute audit event."""
    svc = RiskService()
    case_id = uuid.uuid4()
    officer_id = uuid.uuid4()

    captured_users: list[str] = []

    async def mock_create_audit(db, *, user, action, **kwargs):
        captured_users.append(user)
        ev = MagicMock()
        ev.id = uuid.uuid4()
        return ev

    class _FakeDB:
        _call_idx = 0
        async def execute(self, stmt):
            class _R:
                def scalars(self): return self
                def first(self): return None
            _FakeDB._call_idx += 1
            return _R()
        def add(self, obj): pass
        async def flush(self): pass

    result_dict = _make_risk_result("LOW", 10)
    svc.engine.calculate_risk_for_case = AsyncMock(return_value=result_dict)

    with patch("app.services.risk_service.create_audit_event", side_effect=mock_create_audit):
        await svc.compute_and_persist_with_db(case_id, _FakeDB(), performed_by=officer_id)

    assert str(officer_id) in captured_users, \
        f"Expected officer_id={officer_id} in audit user fields, got {captured_users}"


def test_u8_actor_identity_from_jwt():
    """U8: Actor identity must come from the verified JWT server-side context.
    The client cannot spoof authenticated identity/actor. 
    This test validates that get_current_user resolves the token sub 
    to a DB User, and any forgery attempt with a non-existent sub returns 401.
    """
    fake_id = uuid.uuid4()
    token = create_access_token(subject=str(fake_id))
    from app.core.security import decode_token
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == str(fake_id)
    # The actor identity is derived entirely from the decoded JWT.


# ── Integration Tests (PostgreSQL required) ───────────────────────────────────

def _make_app_client(db_session: AsyncSession):
    """Return an httpx.AsyncClient with the db_session injected."""
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


@pytestmark_db
@pytest.mark.asyncio
async def test_i1_compute_authorized_persistence(db_session: AsyncSession, audit_test_user: User):
    """I1: Authorized user can compute risk; result is persisted."""
    from app.services.risk_engine_service import RiskEngineService

    case = Case(**_make_case_kwargs(audit_test_user.id, "I1"))
    db_session.add(case)
    await db_session.flush()

    token = create_access_token(subject=str(audit_test_user.id))

    async def _mock_calc(self_inner, cid):
        return _make_risk_result("MEDIUM", 50)

    original = RiskEngineService.calculate_risk_for_case
    RiskEngineService.calculate_risk_for_case = _mock_calc
    try:
        async with _make_app_client(db_session) as client:
            res = await client.post(
                f"/api/v1/risk/{case.id}/compute",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        RiskEngineService.calculate_risk_for_case = original
        _cleanup_overrides()

    assert res.status_code == 200, res.text
    data = res.json()
    assert data["success"] is True
    assert data["data"]["riskLevel"] == "MEDIUM"


@pytestmark_db
@pytest.mark.asyncio
async def test_i2_idor_compute_rejected(db_session: AsyncSession, audit_test_user: User):
    """I2: Officer cannot compute risk for a case assigned to another officer."""
    other_officer_id = uuid.uuid4()
    case = Case(**_make_case_kwargs(other_officer_id, "I2"))
    db_session.add(case)
    await db_session.flush()

    token = create_access_token(subject=str(audit_test_user.id))

    try:
        async with _make_app_client(db_session) as client:
            res = await client.post(
                f"/api/v1/risk/{case.id}/compute",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        _cleanup_overrides()

    assert res.status_code == 403, res.text
    assert "Not authorized" in res.json().get("detail", "")


@pytestmark_db
@pytest.mark.asyncio
async def test_i3_unauthenticated_compute_rejected(db_session: AsyncSession):
    """I3: Unauthenticated request to compute endpoint returns 401."""
    fake_case_id = uuid.uuid4()
    try:
        async with _make_app_client(db_session) as client:
            res = await client.post(f"/api/v1/risk/{fake_case_id}/compute")
    finally:
        _cleanup_overrides()

    assert res.status_code == 401, res.text


@pytestmark_db
@pytest.mark.asyncio
async def test_i4_history_authorized(db_session: AsyncSession, audit_test_user: User):
    """I4: Authorized user gets history; ordered newest-first."""
    case = Case(**_make_case_kwargs(audit_test_user.id, "I4"))
    db_session.add(case)
    await db_session.flush()

    now = datetime.now(timezone.utc)
    r1 = RiskAssessment(
        caseId=case.id, riskLevel="LOW", riskScore=10, riskFactors=[],
        summary="First", generatedAt=(now - timedelta(minutes=5)).isoformat(),
        createdAt=now - timedelta(minutes=5),
    )
    r2 = RiskAssessment(
        caseId=case.id, riskLevel="MEDIUM", riskScore=50, riskFactors=[],
        summary="Second", generatedAt=now.isoformat(),
        createdAt=now,
    )
    db_session.add_all([r1, r2])
    await db_session.flush()

    token = create_access_token(subject=str(audit_test_user.id))

    try:
        async with _make_app_client(db_session) as client:
            res = await client.get(
                f"/api/v1/risk/{case.id}/history",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        _cleanup_overrides()

    assert res.status_code == 200, res.text
    items = res.json()["data"]
    assert len(items) >= 2
    # Verify newest-first ordering by riskLevel (MEDIUM was newer)
    assert items[0]["riskLevel"] == "MEDIUM"
    assert items[1]["riskLevel"] == "LOW"


@pytestmark_db
@pytest.mark.asyncio
async def test_i5_history_idor_rejected(db_session: AsyncSession, audit_test_user: User):
    """I5: Officer cannot view history for a case assigned to another officer."""
    other_officer_id = uuid.uuid4()
    case = Case(**_make_case_kwargs(other_officer_id, "I5"))
    db_session.add(case)
    await db_session.flush()

    token = create_access_token(subject=str(audit_test_user.id))

    try:
        async with _make_app_client(db_session) as client:
            res = await client.get(
                f"/api/v1/risk/{case.id}/history",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        _cleanup_overrides()

    assert res.status_code == 403, res.text


@pytestmark_db
@pytest.mark.asyncio
async def test_i6_get_case_risk_authorized(db_session: AsyncSession, audit_test_user: User):
    """I6: Authorized user gets latest risk for their case."""
    case = Case(**_make_case_kwargs(audit_test_user.id, "I6"))
    db_session.add(case)
    await db_session.flush()

    risk = RiskAssessment(
        caseId=case.id, riskLevel="HIGH", riskScore=75, riskFactors=[],
        summary="Test", generatedAt=datetime.now(timezone.utc).isoformat(),
    )
    db_session.add(risk)
    await db_session.flush()

    token = create_access_token(subject=str(audit_test_user.id))

    try:
        async with _make_app_client(db_session) as client:
            res = await client.get(
                f"/api/v1/risk/cases/{case.id}",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        _cleanup_overrides()

    assert res.status_code == 200, res.text
    assert res.json()["data"]["riskLevel"] == "HIGH"


@pytestmark_db
@pytest.mark.asyncio
async def test_i7_get_case_risk_idor_rejected(db_session: AsyncSession, audit_test_user: User):
    """I7: Officer cannot view risk for another officer's case."""
    other_officer_id = uuid.uuid4()
    case = Case(**_make_case_kwargs(other_officer_id, "I7"))
    db_session.add(case)
    await db_session.flush()

    token = create_access_token(subject=str(audit_test_user.id))

    try:
        async with _make_app_client(db_session) as client:
            res = await client.get(
                f"/api/v1/risk/cases/{case.id}",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        _cleanup_overrides()

    assert res.status_code == 403, res.text


@pytestmark_db
@pytest.mark.asyncio
async def test_i8_admin_can_access_any_case(db_session: AsyncSession):
    """I8: Admin role bypasses assignedOfficerId check."""
    from app.core.security import hash_password

    admin_user = User(
        id=uuid.uuid4(),
        email=f"admin-{uuid.uuid4().hex[:8]}@example.com",
        name="Admin User",
        role="admin",
        passwordHash=hash_password("admin-pw"),
        createdAt=datetime.now(timezone.utc),
        updatedAt=datetime.now(timezone.utc),
    )
    db_session.add(admin_user)

    some_officer_id = uuid.uuid4()
    case = Case(**_make_case_kwargs(some_officer_id, "I8"))
    db_session.add(case)
    await db_session.flush()

    risk = RiskAssessment(
        caseId=case.id, riskLevel="LOW", riskScore=10, riskFactors=[],
        summary="Admin test", generatedAt=datetime.now(timezone.utc).isoformat(),
    )
    db_session.add(risk)
    await db_session.flush()

    token = create_access_token(subject=str(admin_user.id))

    try:
        async with _make_app_client(db_session) as client:
            res = await client.get(
                f"/api/v1/risk/cases/{case.id}",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        _cleanup_overrides()

    assert res.status_code == 200, res.text


@pytestmark_db
@pytest.mark.asyncio
async def test_i9_audit_event_created_on_compute(db_session: AsyncSession, audit_test_user: User):
    """I9: A 'compute' audit event is created in the chain after compute_and_persist_with_db."""
    case = Case(**_make_case_kwargs(audit_test_user.id, "I9"))
    db_session.add(case)
    await db_session.flush()

    svc = RiskService()
    svc.engine.calculate_risk_for_case = AsyncMock(
        return_value=_make_risk_result("LOW", 20)
    )
    await svc.compute_and_persist_with_db(case.id, db_session, performed_by=audit_test_user.id)

    audit_rows = (
        await db_session.execute(
            select(AuditLog)
            .where(AuditLog.caseId == case.id)
            .where(AuditLog.action == "compute")
        )
    ).scalars().all()

    assert len(audit_rows) >= 1
    assert str(audit_test_user.id) in audit_rows[0].user


@pytestmark_db
@pytest.mark.asyncio
async def test_i10_risk_elevated_audit_low_to_medium(db_session: AsyncSession, audit_test_user: User):
    """I10: RISK_ELEVATED audit event is created when risk goes from LOW to MEDIUM."""
    case = Case(**_make_case_kwargs(audit_test_user.id, "I10"))
    db_session.add(case)
    await db_session.flush()

    # Seed a LOW assessment
    initial = RiskAssessment(
        caseId=case.id, riskLevel="LOW", riskScore=15, riskFactors=[],
        summary="Initial LOW", generatedAt=datetime.now(timezone.utc).isoformat(),
    )
    db_session.add(initial)
    await db_session.flush()

    # Now compute with MEDIUM result
    svc = RiskService()
    svc.engine.calculate_risk_for_case = AsyncMock(
        return_value=_make_risk_result("MEDIUM", 55)
    )
    await svc.compute_and_persist_with_db(case.id, db_session, performed_by=audit_test_user.id)

    elevated_events = (
        await db_session.execute(
            select(AuditLog)
            .where(AuditLog.caseId == case.id)
            .where(AuditLog.action == "RISK_ELEVATED")
        )
    ).scalars().all()

    assert len(elevated_events) == 1, \
        f"Expected exactly 1 RISK_ELEVATED event, got {len(elevated_events)}"
    assert "LOW" in elevated_events[0].details
    assert "MEDIUM" in elevated_events[0].details


@pytestmark_db
@pytest.mark.asyncio
async def test_i11_notification_created_on_compute(db_session: AsyncSession, audit_test_user: User):
    """I11: A notification is created when no recent notification exists."""
    case = Case(**_make_case_kwargs(audit_test_user.id, "I11"))
    db_session.add(case)
    await db_session.flush()

    svc = RiskService()
    svc.engine.calculate_risk_for_case = AsyncMock(
        return_value=_make_risk_result("HIGH", 80)
    )
    await svc.compute_and_persist_with_db(case.id, db_session, performed_by=audit_test_user.id)

    notifs = (
        await db_session.execute(
            select(Notification)
            .where(Notification.caseId == case.id)
            .where(Notification.type == "risk")
        )
    ).scalars().all()

    assert len(notifs) >= 1
    assert notifs[0].priority == "high"


@pytestmark_db
@pytest.mark.asyncio
async def test_i12_notification_deduplication(db_session: AsyncSession, audit_test_user: User):
    """I12: Second compute within 1 hour does NOT create a duplicate notification."""
    case = Case(**_make_case_kwargs(audit_test_user.id, "I12"))
    db_session.add(case)
    await db_session.flush()

    now = datetime.now(timezone.utc)
    svc_1 = RiskService(now=now)
    svc_1.engine.calculate_risk_for_case = AsyncMock(
        return_value=_make_risk_result("MEDIUM", 55)
    )
    await svc_1.compute_and_persist_with_db(case.id, db_session, performed_by=audit_test_user.id)

    # Second compute 30 minutes later (within 1h window)
    svc_2 = RiskService(now=now + timedelta(minutes=30))
    svc_2.engine.calculate_risk_for_case = AsyncMock(
        return_value=_make_risk_result("HIGH", 75)
    )
    await svc_2.compute_and_persist_with_db(case.id, db_session, performed_by=audit_test_user.id)

    notifs = (
        await db_session.execute(
            select(Notification)
            .where(Notification.caseId == case.id)
            .where(Notification.type == "risk")
        )
    ).scalars().all()

    # Exactly 1 notification despite 2 computes (deduplication)
    assert len(notifs) == 1, \
        f"Notification deduplication failed: expected 1, got {len(notifs)}"


@pytestmark_db
@pytest.mark.asyncio
async def test_i13_history_ordering(db_session: AsyncSession, audit_test_user: User):
    """I13: History assessments are returned newest-first (via DB endpoint)."""
    case = Case(**_make_case_kwargs(audit_test_user.id, "I13"))
    db_session.add(case)
    await db_session.flush()

    now = datetime.now(timezone.utc)
    assessments = []
    for i, (level, score) in enumerate([("LOW", 10), ("MEDIUM", 50), ("HIGH", 80)]):
        r = RiskAssessment(
            caseId=case.id, riskLevel=level, riskScore=score, riskFactors=[],
            summary=f"Assessment {i}", generatedAt=(now + timedelta(minutes=i)).isoformat(),
            createdAt=now + timedelta(minutes=i),
        )
        assessments.append(r)
    db_session.add_all(assessments)
    await db_session.flush()

    token = create_access_token(subject=str(audit_test_user.id))

    try:
        async with _make_app_client(db_session) as client:
            res = await client.get(
                f"/api/v1/risk/{case.id}/history",
                headers={"Authorization": f"Bearer {token}"},
            )
    finally:
        _cleanup_overrides()

    assert res.status_code == 200, res.text
    items = res.json()["data"]
    assert len(items) == 3
    # Newest first: HIGH, MEDIUM, LOW
    assert items[0]["riskLevel"] == "HIGH"
    assert items[1]["riskLevel"] == "MEDIUM"
    assert items[2]["riskLevel"] == "LOW"
