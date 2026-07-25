from __future__ import annotations

from typing import Generic, List, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class Pagination(BaseModel):
    page: int
    pageSize: int
    total: int
    totalPages: int


class ApiResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)
    success: bool = True
    message: str
    data: T


class PaginatedResponse(BaseModel, Generic[T]):
    model_config = ConfigDict(from_attributes=True)
    success: bool = True
    message: str
    data: List[T]
    pagination: Pagination
