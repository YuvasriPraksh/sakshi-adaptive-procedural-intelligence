"""Integration tests for audit hooks."""

import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.audit_log import AuditLog
from app.models.user import User
from app.core.security import create_access_token
from app.tests.conftest import pytestmark_db

async def get_audit_logs(db_session: AsyncSession, action: str):
    res = await db_session.execute(select(AuditLog).where(AuditLog.action == action))
    return res.scalars().all()

@pytestmark_db
@pytest.mark.asyncio
async def test_auth_audit_hooks(client: AsyncClient, audit_test_user: User, db_session: AsyncSession):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": audit_test_user.email, "password": "test-password-123"}
    )
    assert response.status_code == 200
    
    logs = await get_audit_logs(db_session, "LOGIN_SUCCESS")
    assert len(logs) == 1
    assert logs[0].user == audit_test_user.name
    assert logs[0].userRole == audit_test_user.role

@pytestmark_db
@pytest.mark.asyncio
async def test_cases_audit_hooks(client: AsyncClient, audit_test_user: User, db_session: AsyncSession):
    token = create_access_token(str(audit_test_user.id))
    headers = {"Authorization": f"Bearer {token}"}
    
    case_payload = {
        "caseNumber": "CAS-TEST-001",
        "firNumber": "FIR-TEST-001",
        "crimeType": "POCSO",
        "victimCode": "V-TEST",
        "victimAge": 14,
        "victimGender": "Female",
        "incidentDate": "2024-01-01T00:00:00Z",
        "incidentLocation": "Test Loc",
        "district": "Test Dist",
        "state": "Test State"
    }
    
    # Create case
    res = await client.post(
        "/api/v1/cases",
        json=case_payload,
        headers=headers
    )
    assert res.status_code == 200
    case_id = res.json()["data"]["id"]
    
    logs = await get_audit_logs(db_session, "CASE_CREATED")
    assert len(logs) == 1
    assert str(logs[0].caseId) == case_id
    assert logs[0].user == audit_test_user.name

@pytestmark_db
@pytest.mark.asyncio
async def test_evidence_audit_hooks(client: AsyncClient, audit_test_user: User, db_session: AsyncSession):
    token = create_access_token(str(audit_test_user.id))
    headers = {"Authorization": f"Bearer {token}"}
    
    case_payload = {
        "caseNumber": "CAS-EVD-001",
        "firNumber": "FIR-EVD-001",
        "crimeType": "POCSO",
        "victimCode": "V-EVD",
        "victimAge": 14,
        "victimGender": "Female",
        "incidentDate": "2024-01-01T00:00:00Z",
        "incidentLocation": "Test Loc",
        "district": "Test Dist",
        "state": "Test State"
    }
    
    case_res = await client.post("/api/v1/cases", json=case_payload, headers=headers)
    case_id = case_res.json()["data"]["id"]
    
    evidence_payload = {
        "evidenceId": "EVD-TEST-001",
        "caseId": case_id,
        "caseNumber": "CAS-TEST-001",
        "type": "physical",
        "description": "Desc",
        "collectedBy": "Officer",
        "collectedByRole": "Investigator",
        "agency": "Police",
        "collectionDate": "2024-01-01",
        "collectionTime": "12:00",
        "gpsLocation": "Loc",
        "gpsCoords": {"lat": 0.0, "lng": 0.0},
        "status": "registered",
        "currentCustody": "Police",
        "currentOfficer": "Officer",
        "initialHash": "hash",
        "currentHash": "hash",
        "verificationStatus": "pending",
        "evidenceToken": "tok",
        "sealNumber": "seal",
        "photographs": 0
    }
    
    res = await client.post(
        "/api/v1/evidence",
        json=evidence_payload,
        headers=headers
    )
    assert res.status_code == 200
    
    logs = await get_audit_logs(db_session, "EVIDENCE_CREATED")
    assert len(logs) == 1
    assert logs[0].user == audit_test_user.name

@pytestmark_db
@pytest.mark.asyncio
async def test_ai_audit_hooks(client: AsyncClient, audit_test_user: User, db_session: AsyncSession):
    token = create_access_token(str(audit_test_user.id))
    headers = {"Authorization": f"Bearer {token}"}
    
    case_payload = {
        "caseNumber": "CAS-AI-001",
        "firNumber": "FIR-AI-001",
        "crimeType": "POCSO",
        "victimCode": "V-AI",
        "victimAge": 14,
        "victimGender": "Female",
        "incidentDate": "2024-01-01T00:00:00Z",
        "incidentLocation": "Test Loc",
        "district": "Test Dist",
        "state": "Test State"
    }
    
    # Need to create a case first so AI has a case
    case_res = await client.post(
        "/api/v1/cases",
        json=case_payload,
        headers=headers
    )
    
    res = await client.post(
        "/api/v1/ai/chat",
        json={"message": "Hello AI", "intent": "general"},
        headers=headers
    )
    assert res.status_code == 200
    
    logs = await get_audit_logs(db_session, "AI_PROCEDURAL_QUERY")
    assert len(logs) >= 1
    assert logs[-1].user == audit_test_user.name

