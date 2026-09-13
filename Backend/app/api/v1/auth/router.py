from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    verify_password,
    decode_token,
)
from app.dependencies.auth import get_current_user_id, require_access_token
from app.models.user import User
from app.schemas.auth import (
    AuthResponse,
    AuthTokens,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    RefreshRequest,
    UserOut,
)
from app.schemas.common import ApiResponse

router = APIRouter()


@router.post("/login", response_model=ApiResponse[AuthResponse])
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    query = select(User).where(User.email == credentials.email.lower())
    result = await db.execute(query)
    user = result.scalars().first()
    if not user or not verify_password(credentials.password, user.passwordHash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    tokens = AuthTokens(
        accessToken=create_access_token(subject=str(user.id)),
        refreshToken=create_refresh_token(subject=str(user.id)),
    )

    return {
        "success": True,
        "message": "Login successful",
        "data": {
            "user": UserOut.from_orm(user),
            "tokens": tokens,
        },
    }


@router.post("/register", response_model=ApiResponse[AuthResponse])
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    try:
        query = select(User).where(User.email == payload.email.lower())
        result = await db.execute(query)
        existing = result.scalars().first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already registered.",
            )

        user = User(
            email=payload.email.lower(),
            name=payload.name,
            role="police",
            passwordHash=hash_password(payload.password),
            createdAt=datetime.now(timezone.utc),
            updatedAt=datetime.now(timezone.utc),
        )
        db.add(user)
        await db.flush()
        await db.commit()

        tokens = AuthTokens(
            accessToken=create_access_token(subject=str(user.id)),
            refreshToken=create_refresh_token(subject=str(user.id)),
        )

        return {
            "success": True,
            "message": "Registration successful",
            "data": {
                "user": UserOut.from_orm(user),
                "tokens": tokens,
            },
        }
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/logout", response_model=ApiResponse[Optional[dict]])
async def logout() -> dict:
    return {"success": True, "message": "Logout successful", "data": None}


@router.get("/me", response_model=ApiResponse[UserOut])
async def me(
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
) -> dict:
    query = select(User).where(User.id == UUID(user_id))
    result = await db.execute(query)
    user = result.scalars().first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Authenticated user not found.",
        )
    return {"success": True, "message": "OK", "data": UserOut.from_orm(user)}


@router.post("/refresh", response_model=ApiResponse[AuthTokens])
async def refresh_token(payload: RefreshRequest) -> dict:
    token_payload = decode_token(payload.refreshToken)
    if not token_payload or token_payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token.",
        )
    subject = token_payload.get("sub")
    if not subject:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing subject.",
        )
    return {
        "success": True,
        "message": "Token refreshed",
        "data": {
            "accessToken": create_access_token(subject=subject),
            "refreshToken": create_refresh_token(subject=subject),
        },
    }


@router.post("/forgot-password", response_model=ApiResponse[Optional[dict]])
async def forgot_password(payload: ForgotPasswordRequest) -> dict:
    # Real email delivery can be added later.
    return {
        "success": True,
        "message": "If the email is registered, a password reset link was sent.",
        "data": None,
    }


@router.get("/protected", dependencies=[Depends(require_access_token)])
async def protected() -> dict:
    return {"success": True, "message": "Authorized", "data": {}}
