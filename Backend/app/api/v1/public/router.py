"""
Public router — endpoints that require no authentication.
Used for ping/status checks and any open API surface.
"""

from fastapi import APIRouter
from fastapi.responses import JSONResponse

router = APIRouter()


@router.get("/ping", summary="Ping")
async def ping() -> JSONResponse:
    """Simple connectivity check."""
    return JSONResponse({"ping": "pong"})


@router.get("/status", summary="API Status")
async def status() -> JSONResponse:
    """Return API operational status."""
    return JSONResponse({"api": "v1", "status": "operational"})
