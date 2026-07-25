"""
Auth dependency re-exports.
Import from here in route files for a consistent, clean interface.
"""

from app.core.auth import (  # noqa: F401
    get_current_token_payload,
    get_current_user_id,
    require_access_token,
)

__all__ = [
    "get_current_token_payload",
    "get_current_user_id",
    "require_access_token",
]
