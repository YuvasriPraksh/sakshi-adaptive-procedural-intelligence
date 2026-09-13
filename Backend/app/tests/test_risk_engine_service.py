import asyncio
import uuid
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, patch

import pytest

from app.services.risk_engine_service import RiskEngineService
from app.models.case import Case
from app.models.workflow import Workflow
from app.models.workflow_history import WorkflowHistory

# Helper fake session
class FakeResult:
    def __init__(self, items):
        self._items = items

    def scalars(self):
        return self

    def all(self):
        return self._items

    def first(self):
        return self._items[0] if self._items else None

class FakeSession:
    def __init__(self, case_obj, workflows, history):
        self._case = case_obj
        self._workflows = workflows
        self._history = history
        self._call_index = 0

    async def __aenter__(self):
        self._call_index = 0
        return self

    async def __aexit__(self, exc_type, exc, tb):
        pass

    async def get(self, model, pk):
        if model is Case:
            return self._case
        return None

    async def execute(self, stmt):
        # Simple detection based on call order: first call -> workflows, second -> history
        if self._call_index == 0:
            self._call_index += 1
            return FakeResult(self._workflows)
        else:
            return FakeResult(self._history)

    async def flush(self):
        pass

    def add(self, obj):
        pass

# Dummy DPOGEngine that returns controlled readiness and nodes
class DummyDPOGEngine:
    def __init__(self, readiness_score=80, nodes=None):
        self.readiness_score = readiness_score
        self.nodes = nodes or []

    def evaluate_graph(self, case_id: str, case_number: str, db_stages):
        return {
            "readiness": {"score": self.readiness_score},
            "nodes": self.nodes,
        }

# Utility to create a minimal case object
class DummyCase:
    def __init__(self, case_id, case_number="C-001"):
        self.id = case_id
        self.caseNumber = case_number

# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------
@pytest.mark.asyncio
async def test_readiness_inversion_and_score_boundaries():
    case_id = uuid.uuid4()
    case = DummyCase(case_id)
    # No workflow stages, no history – focus on readiness only
    fake_session = FakeSession(case, [], [])
    dummy_engine = DummyDPOGEngine(readiness_score=70)
    service = RiskEngineService()
    service.dpog_engine = dummy_engine
    # Patch async_session to return our fake session
    with patch('app.core.database.async_session', return_value=fake_session):
        result = await service.calculate_risk_for_case(case_id)
    # readiness risk = 30 (100-70)
    assert result["readinessRisk"] == 30
    # other factors are zero, raw_score = 30 * 0.35 = 10.5 -> rounded 11
    # risk level should be LOW (<=30)
    assert result["riskScore"] == 11
    assert result["riskLevel"] == "LOW"

@pytest.mark.asyncio
async def test_deadline_overdue_and_near_due():
    now = datetime(2023, 1, 1, 12, 0, tzinfo=timezone.utc)
    case_id = uuid.uuid4()
    case = DummyCase(case_id)
    # Workflow with deadline 5 hours overdue
    overdue_deadline = (now - timedelta(hours=5)).isoformat()
    wf = Workflow()
    wf.deadline = overdue_deadline
    # History empty
    fake_session = FakeSession(case, [wf], [])
    dummy_engine = DummyDPOGEngine(readiness_score=100)
    service = RiskEngineService(now=now)
    service.dpog_engine = dummy_engine
    with patch('app.core.database.async_session', return_value=fake_session):
        result = await service.calculate_risk_for_case(case_id)
    # Overdue 5h => deadline factor = min(100, 5*10) = 50
    assert result["deadlineFactor"] == 50
    # readiness risk = 0 (100-100)
    # raw = 0*0.35 + 50*0.25 = 12.5 -> rounded 13
    assert result["riskScore"] == 13
    assert result["riskLevel"] == "LOW"
    # Near‑due (e.g., 12h remaining) should give linear factor
    near_deadline = (now + timedelta(hours=12)).isoformat()
    wf2 = Workflow()
    wf2.deadline = near_deadline
    fake_session2 = FakeSession(case, [wf2], [])
    with patch('app.core.database.async_session', return_value=fake_session2):
        result2 = await service.calculate_risk_for_case(case_id)
    # 12h left => factor = (24-12)*(100/24)=50
    assert result2["deadlineFactor"] == 50

@pytest.mark.asyncio
async def test_missing_and_invalid_deadline():
    now = datetime(2023, 1, 1, tzinfo=timezone.utc)
    case_id = uuid.uuid4()
    case = DummyCase(case_id)
    wf_missing = Workflow()
    wf_missing.deadline = None
    fake_session = FakeSession(case, [wf_missing], [])
    dummy_engine = DummyDPOGEngine(readiness_score=0)
    service = RiskEngineService(now=now)
    service.dpog_engine = dummy_engine
    with patch('app.core.database.async_session', return_value=fake_session):
        result = await service.calculate_risk_for_case(case_id)
    assert result["deadlineFactor"] == 0
    # Invalid deadline string
    wf_invalid = Workflow()
    wf_invalid.deadline = "not-a-date"
    fake_session2 = FakeSession(case, [wf_invalid], [])
    with patch('app.core.database.async_session', return_value=fake_session2):
        result2 = await service.calculate_risk_for_case(case_id)
    assert result2["deadlineFactor"] == 0

@pytest.mark.asyncio
async def test_stall_detection_and_no_stall():
    now = datetime(2023, 1, 10, tzinfo=timezone.utc)
    case_id = uuid.uuid4()
    case = DummyCase(case_id)
    # History entry 10 days ago (240h) -> exceeds 168h threshold
    past_change = (now - timedelta(hours=240)).isoformat()
    wh = WorkflowHistory()
    wh.changedAt = past_change
    fake_session = FakeSession(case, [], [wh])
    dummy_engine = DummyDPOGEngine(readiness_score=0)
    service = RiskEngineService(now=now)
    service.dpog_engine = dummy_engine
    with patch('app.core.database.async_session', return_value=fake_session):
        result = await service.calculate_risk_for_case(case_id)
    assert result["stallFactor"] == 100
    # Recent change within threshold -> no stall
    recent_change = (now - timedelta(hours=10)).isoformat()
    wh2 = WorkflowHistory()
    wh2.changedAt = recent_change
    fake_session2 = FakeSession(case, [], [wh2])
    with patch('app.core.database.async_session', return_value=fake_session2):
        result2 = await service.calculate_risk_for_case(case_id)
    assert result2["stallFactor"] == 0

@pytest.mark.asyncio
async def test_dependency_factor_and_no_blockers():
    case_id = uuid.uuid4()
    case = DummyCase(case_id)
    # No workflow stages, no history
    fake_session = FakeSession(case, [], [])
    # Nodes with a root blocker affecting 3 of 5 stages
    nodes = [
        {"stageId": "s1", "rootBlockerInfo": {"downstreamImpactCount": 3}},
        {"stageId": "s2"},
        {"stageId": "s3"},
        {"stageId": "s4"},
        {"stageId": "s5"},
    ]
    dummy_engine = DummyDPOGEngine(readiness_score=0, nodes=nodes)
    service = RiskEngineService()
    service.dpog_engine = dummy_engine
    with patch('app.core.database.async_session', return_value=fake_session):
        result = await service.calculate_risk_for_case(case_id)
    # Downstream impact 3 out of 5 => 60% => factor 60
    assert result["dependencyFactor"] == 60
    # Now test with no blockers (no rootBlockerInfo)
    nodes_no_block = [{"stageId": "s1"}, {"stageId": "s2"}]
    dummy_engine2 = DummyDPOGEngine(readiness_score=0, nodes=nodes_no_block)
    service.dpog_engine = dummy_engine2
    with patch('app.core.database.async_session', return_value=fake_session):
        result2 = await service.calculate_risk_for_case(case_id)
    assert result2["dependencyFactor"] == 0

@pytest.mark.asyncio
async def test_deterministic_repeatability():
    now = datetime(2023, 5, 1, 9, 0, tzinfo=timezone.utc)
    case_id = uuid.uuid4()
    case = DummyCase(case_id)
    wf = Workflow()
    wf.deadline = (now + timedelta(hours=6)).isoformat()
    wh = WorkflowHistory()
    wh.changedAt = (now - timedelta(hours=200)).isoformat()
    fake_session = FakeSession(case, [wf], [wh])
    dummy_engine = DummyDPOGEngine(readiness_score=55, nodes=[])
    service = RiskEngineService(now=now)
    service.dpog_engine = dummy_engine
    with patch('app.core.database.async_session', return_value=fake_session):
        r1 = await service.calculate_risk_for_case(case_id)
        r2 = await service.calculate_risk_for_case(case_id)
    assert r1 == r2
