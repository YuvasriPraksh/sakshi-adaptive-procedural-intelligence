"""Shared fixtures for backend tests."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from httpx import AsyncClient, ASGITransport

from app.core.config import settings
from app.core.security import hash_password
from app.models.user import User
from app.main import app
from app.core.database import get_db

def _postgres_reachable() -> bool:
    url = settings.DATABASE_URL or ""
    return url.startswith("postgresql")

pytestmark_db = pytest.mark.skipif(
    not _postgres_reachable(),
    reason="PostgreSQL DATABASE_URL required for audit chain integration tests",
)

@pytest_asyncio.fixture
async def db_session():
    """
    Async session wrapped in an outer transaction that is rolled back after each test.
    """
    engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)
    async with engine.connect() as connection:
        transaction = await connection.begin()
        session_factory = async_sessionmaker(
            bind=connection,
            class_=AsyncSession,
            expire_on_commit=False,
            autocommit=False,
            autoflush=False,
        )
        async with session_factory() as session:
            yield session
        await transaction.rollback()
    await engine.dispose()

@pytest_asyncio.fixture
async def audit_test_user(db_session: AsyncSession) -> User:
    """Persist a unique user for audit API identity tests."""
    user = User(
        id=uuid.uuid4(),
        email=f"audit-test-{uuid.uuid4().hex[:8]}@example.com",
        name="Audit Test Officer",
        role="police",
        passwordHash=hash_password("test-password-123"),
        createdAt=datetime.now(timezone.utc),
        updatedAt=datetime.now(timezone.utc),
    )
    db_session.add(user)
    await db_session.flush()
    return user

@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    app.dependency_overrides[get_db] = lambda: db_session
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test"
    ) as c:
        yield c
    app.dependency_overrides.clear()
