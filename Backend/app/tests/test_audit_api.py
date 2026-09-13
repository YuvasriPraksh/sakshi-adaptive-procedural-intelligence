"""Phase 5A — audit API tests (identity + verification response semantics)."""

from __future__ import annotations

import uuid
from collections.abc import AsyncGenerator

import httpx
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import create_access_token
from app.main import app
from app.models.user import User
from app.services import audit_chain_service as svc
from app.tests.conftest import pytestmark_db


async def _override_db(session: AsyncSession):
    async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield session

    app.dependency_overrides[get_db] = override_get_db


@pytestmark_db
@pytest.mark.asyncio
async def test_create_audit_uses_jwt_actor_not_client_spoof(
    db_session: AsyncSession,
    audit_test_user: User,
):
    await _override_db(db_session)
    token = create_access_token(subject=str(audit_test_user.id))
    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.post(
                "/api/v1/audit",
                json={
                    "module": "cases",
                    "action": "Spoof Attempt",
                    "user": "Evil Actor",
                    "userRole": "admin",
                    "details": "should ignore spoofed identity",
                },
                headers={"Authorization": f"Bearer {token}"},
            )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["user"] == audit_test_user.name
        assert body["data"]["userRole"] == audit_test_user.role
        assert body["data"]["user"] != "Evil Actor"
    finally:
        app.dependency_overrides.clear()


@pytestmark_db
@pytest.mark.asyncio
async def test_verify_invalid_chain_returns_409_and_success_false(
    db_session: AsyncSession,
    audit_test_user: User,
):
    case_id = uuid.uuid4()
    event = await svc.create_audit_event(
        db_session,
        module="cases",
        action="Row",
        user="U1",
        user_role="police",
        case_id=case_id,
    )
    event.details = "post-hash tamper"

    await _override_db(db_session)
    token = create_access_token(subject=str(audit_test_user.id))
    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.get(
                f"/api/v1/audit/verify/{case_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
        assert response.status_code == 409
        body = response.json()
        assert body["success"] is False
        assert body["data"]["valid"] is False
        assert body["data"]["failure_type"] == "HASH_MISMATCH"
    finally:
        app.dependency_overrides.clear()


@pytestmark_db
@pytest.mark.asyncio
async def test_verify_valid_chain_returns_200_and_success_true(
    db_session: AsyncSession,
    audit_test_user: User,
):
    case_id = uuid.uuid4()
    await svc.create_audit_event(
        db_session,
        module="cases",
        action="OK",
        user="U1",
        user_role="police",
        case_id=case_id,
    )

    await _override_db(db_session)
    token = create_access_token(subject=str(audit_test_user.id))
    try:
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://test",
        ) as client:
            response = await client.get(
                f"/api/v1/audit/verify/{case_id}",
                headers={"Authorization": f"Bearer {token}"},
            )
        assert response.status_code == 200
        body = response.json()
        assert body["success"] is True
        assert body["data"]["valid"] is True
    finally:
        app.dependency_overrides.clear()
