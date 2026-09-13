from __future__ import annotations

from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class AuthTokens(BaseModel):
    accessToken: str
    refreshToken: str


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    name: str
    avatarUrl: Optional[str] = None
    role: str
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refreshToken: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class AuthResponse(BaseModel):
    user: UserOut
    tokens: AuthTokens

    model_config = ConfigDict(from_attributes=True)
