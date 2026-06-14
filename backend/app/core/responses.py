"""Standard JSON envelope helpers — matches the existing Node API contract."""

from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginationMeta(BaseModel):
    page: int
    limit: int
    total: int
    pages: int = 0
    has_next: bool = False
    has_prev: bool = False
    unread: int | None = None

    @classmethod
    def build(
        cls, *, page: int, limit: int, total: int, unread: int | None = None
    ) -> "PaginationMeta":
        pages = max(1, (total + limit - 1) // limit) if limit else 1
        return cls(
            page=page,
            limit=limit,
            total=total,
            pages=pages,
            has_next=page < pages,
            has_prev=page > 1,
            unread=unread,
        )


class ApiResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "OK"
    data: T | None = None
    meta: PaginationMeta | None = None


def ok(
    data: Any = None,
    message: str = "OK",
    meta: PaginationMeta | None = None,
) -> dict[str, Any]:
    body: dict[str, Any] = {"success": True, "message": message}
    if data is not None:
        body["data"] = data
    if meta is not None:
        body["meta"] = meta.model_dump()
    return body


def created(data: Any = None, message: str = "Created") -> dict[str, Any]:
    return ok(data=data, message=message)
