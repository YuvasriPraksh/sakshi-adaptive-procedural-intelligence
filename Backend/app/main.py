"""
SAKSHI Backend – FastAPI application factory.

Responsibilities:
- Create and configure the FastAPI app instance
- Register middleware (CORS, logging, request-id)
- Mount API v1 router
- Define root and health endpoints
- Handle lifespan (startup / shutdown) events
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import close_db, init_db
from app.core.logging import logger, setup_logging
from app.api.v1.router import api_router
from app.middleware.logging_middleware import LoggingMiddleware
from app.middleware.request_id_middleware import RequestIDMiddleware


# ── Lifespan ──────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application startup and shutdown."""
    # --- Startup ---
    setup_logging()
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment : {settings.ENVIRONMENT}")
    logger.info(f"Debug mode  : {settings.DEBUG}")
    await init_db()
    logger.info("Application startup complete.")
    yield
    # --- Shutdown ---
    logger.info("Shutting down application…")
    await close_db()
    logger.info("Application shutdown complete.")


# ── Application Factory ───────────────────────────────────────────────────────
def create_application() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=settings.APP_DESCRIPTION,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
    )

    # ── Middleware (order matters — outermost added last) ─────────────────────
    # GZip compression for large responses
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Custom middleware
    app.add_middleware(RequestIDMiddleware)
    app.add_middleware(LoggingMiddleware)

    # ── Routers ───────────────────────────────────────────────────────────────
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)

    # ── Root endpoints ────────────────────────────────────────────────────────
    @app.get("/", tags=["Root"], summary="Root endpoint")
    async def root() -> JSONResponse:
        return JSONResponse({"message": "SAKSHI Backend Running"})

    @app.get("/health", tags=["Health"], summary="Health check")
    async def health() -> JSONResponse:
        db_status = "unreachable"
        try:
            from app.core.database import engine
            from sqlalchemy import text
            async with engine.begin() as conn:
                await conn.execute(text("SELECT 1"))
            db_status = "reachable"
        except Exception as e:
            db_status = f"unreachable: {str(e)}"
        
        return JSONResponse({
            "status": "healthy",
            "database": db_status
        })

    return app


# ── App instance ──────────────────────────────────────────────────────────────
app = create_application()
