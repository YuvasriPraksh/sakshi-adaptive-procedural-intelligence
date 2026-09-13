"""
Async SQLAlchemy 2.0 database engine, session factory, and base model.
Compatible with PostgreSQL via asyncpg driver.
"""

from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings
from app.core.logging import logger


# ── Engine ────────────────────────────────────────────────────────────────────
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,           # SQL query logging in debug mode
    pool_pre_ping=True,            # Verify connections before use
    pool_size=10,                  # Number of persistent connections
    max_overflow=20,               # Extra connections when pool is full
    pool_recycle=3600,             # Recycle connections every hour
)

# ── Session Factory ───────────────────────────────────────────────────────────
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,        # Keep objects accessible after commit
    autocommit=False,
    autoflush=False,
)


# ── Declarative Base ──────────────────────────────────────────────────────────
class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


# ── Dependency ────────────────────────────────────────────────────────────────
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency that provides an async database session.
    Automatically commits on success or rolls back on error.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as exc:
            await session.rollback()
            logger.error(f"Database session error: {exc}")
            raise
        finally:
            await session.close()


# ── Lifecycle Helpers ─────────────────────────────────────────────────────────
async def init_db() -> None:
    """
    Verify DB connectivity and (optionally) create tables.
    Fails gracefully so the server still starts when DB is unreachable —
    useful during local development before a DB is provisioned.
    """
    try:
        # Ensure model metadata is imported before creating tables.
        import app.models  # noqa: F401

        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables initialized.")
    except Exception as exc:
        logger.warning(
            f"Database not reachable at startup (this is OK in dev): {exc}"
        )
        logger.warning(
            "API server will start, but DB-dependent routes will fail "
            "until a valid DATABASE_URL is configured."
        )


async def close_db() -> None:
    """Dispose the engine connection pool on shutdown."""
    await engine.dispose()
    logger.info("Database engine disposed.")
