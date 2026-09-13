"""
Auth dependency re-exports.
Import from here in route files for a consistent, clean interface.
"""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.auth import (  # noqa: F401
    get_current_token_payload,
    get_current_user_id,
    require_access_token,
)
from app.core.database import get_db
from app.models.user import User

__all__ = [
    "get_current_token_payload",
    "get_current_user_id",
    "get_current_user",
    "require_access_token",
]


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Load the authenticated user record from the JWT subject (sub)."""
    try:
        uid = UUID(user_id)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token subject.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    user = await db.get(User, uid)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user
