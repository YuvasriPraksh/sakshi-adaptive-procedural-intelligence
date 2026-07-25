import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_created_at", "created_at"),
        Index("ix_notifications_case_id", "case_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type: Mapped[str] = mapped_column(String(80), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[str] = mapped_column(String(80), nullable=False, default="medium")
    read: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    caseId: Mapped[uuid.UUID] = mapped_column("case_id", UUID(as_uuid=True), ForeignKey("cases.id"), nullable=True)
    caseNumber: Mapped[str] = mapped_column("case_number", String(120), nullable=True)
    actionUrl: Mapped[str] = mapped_column("action_url", String(255), nullable=True)

    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    createdBy: Mapped[uuid.UUID] = mapped_column("created_by", UUID(as_uuid=True), nullable=True)
    updatedBy: Mapped[uuid.UUID] = mapped_column("updated_by", UUID(as_uuid=True), nullable=True)

    case = relationship("Case", back_populates="notifications")
