"""
Authentication dependencies for FastAPI route protection.
Provides reusable Depends() callables for token extraction and validation.
"""

from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.security import decode_token
from app.core.logging import logger

# ── Bearer Token Scheme ───────────────────────────────────────────────────────
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_token_payload(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    """
    Extract and validate the Bearer token from the Authorization header.

    Raises:
        HTTPException 401 if token is missing or invalid.

    Returns:
        Decoded JWT payload dict.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_token(credentials.credentials)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_current_user_id(
    payload: dict = Depends(get_current_token_payload),
) -> str:
    """
    Extract the user id (sub claim) from the validated token payload.

    Returns:
        User id string.
    """
    user_id: Optional[str] = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token subject missing.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.debug(f"Authenticated user_id={user_id}")
    return user_id


async def require_access_token(
    payload: dict = Depends(get_current_token_payload),
) -> dict:
    """
    Ensure the token type is 'access' (not a refresh token).
    """
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return payload
