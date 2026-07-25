"""
HTTP request/response logging middleware.
Logs method, path, status code, and response time for every request.
"""

import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start_time = time.perf_counter()

        response: Response = await call_next(request)

        process_ms = (time.perf_counter() - start_time) * 1000
        request_id = getattr(request.state, "request_id", "-")

        logger.info(
            f"{request.method} {request.url.path} "
            f"→ {response.status_code} "
            f"[{process_ms:.1f}ms] "
            f"rid={request_id}"
        )
        response.headers["X-Process-Time"] = f"{process_ms:.1f}ms"
        return response
