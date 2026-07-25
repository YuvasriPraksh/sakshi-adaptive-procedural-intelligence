"""
Database dependency re-export.
Import get_db from here to keep route files clean.
"""

from app.core.database import get_db  # noqa: F401

__all__ = ["get_db"]
