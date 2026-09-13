"""
Loguru-based logging configuration for the SAKSHI backend.
Provides a pre-configured logger instance with file rotation and
an interceptor that redirects standard library logging to Loguru.
"""

import logging
import sys
from pathlib import Path

from loguru import logger

from app.core.config import settings


# ── Intercept stdlib logging ──────────────────────────────────────────────────
class _InterceptHandler(logging.Handler):
    """Route standard library log records to Loguru."""

    def emit(self, record: logging.LogRecord) -> None:
        # Map stdlib level to Loguru level name
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = str(record.levelno)

        # Find the correct caller depth so Loguru shows the right file/line
        frame, depth = logging.currentframe(), 2
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back  # type: ignore[assignment]
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )


def setup_logging() -> None:
    """
    Configure Loguru sinks:
    - Coloured output to stdout (always active)
    - Rotating file sink (when LOG_FILE is configured)

    Also intercepts uvicorn and SQLAlchemy stdlib loggers.
    """
    # Remove default Loguru sink
    logger.remove()

    # ── stdout sink ───────────────────────────────────────────────────────────
    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )
    logger.add(
        sys.stdout,
        format=log_format,
        level=settings.LOG_LEVEL,
        colorize=True,
        backtrace=True,
        diagnose=settings.DEBUG,
    )

    # ── file sink ─────────────────────────────────────────────────────────────
    if settings.LOG_FILE:
        log_path = Path(settings.LOG_FILE)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        logger.add(
            str(log_path),
            format=log_format,
            level=settings.LOG_LEVEL,
            rotation="10 MB",
            retention="30 days",
            compression="zip",
            backtrace=True,
            diagnose=settings.DEBUG,
            enqueue=True,           # Thread-safe async writes
        )

    # ── Intercept stdlib loggers ──────────────────────────────────────────────
    intercept = _InterceptHandler()
    for name in (
        "uvicorn",
        "uvicorn.access",
        "uvicorn.error",
        "fastapi",
        "sqlalchemy.engine",
    ):
        std_logger = logging.getLogger(name)
        std_logger.handlers = [intercept]
        std_logger.propagate = False

    logger.info(
        f"Logging configured | level={settings.LOG_LEVEL} | env={settings.ENVIRONMENT}"
    )


# Expose the logger so other modules can do: from app.core.logging import logger
__all__ = ["logger", "setup_logging"]
