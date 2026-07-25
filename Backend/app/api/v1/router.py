"""
Central API v1 router.
Each sub-module router is imported and included here.
Business logic routers are stubbed and ready to be populated.
"""

from fastapi import APIRouter

from app.api.v1.analytics.router import router as analytics_router
from app.api.v1.auth.router import router as auth_router
from app.api.v1.ai.router import router as ai_router
from app.api.v1.audit.router import router as audit_router
from app.api.v1.cases.router import router as cases_router
from app.api.v1.evidence.router import router as evidence_router
from app.api.v1.notifications.router import router as notifications_router
from app.api.v1.public.router import router as public_router
from app.api.v1.readiness.router import router as readiness_router
from app.api.v1.reports.router import router as reports_router
from app.api.v1.risk.router import router as risk_router
from app.api.v1.workflow.router import router as workflow_router

api_router = APIRouter()

# ── Public (no auth required) ─────────────────────────────────────────────────
api_router.include_router(public_router, prefix="/public", tags=["Public"])

# ── Registered API routers ────────────────────────────────────────────────────
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(cases_router, prefix="/cases", tags=["Cases"])
api_router.include_router(evidence_router, prefix="/evidence", tags=["Evidence"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI"])
api_router.include_router(audit_router, prefix="/audit", tags=["Audit"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(readiness_router, prefix="/readiness", tags=["Readiness"])
api_router.include_router(reports_router, prefix="/reports", tags=["Reports"])
api_router.include_router(risk_router, prefix="/risk", tags=["Risk"])
api_router.include_router(workflow_router, prefix="/workflow", tags=["Workflow"])
