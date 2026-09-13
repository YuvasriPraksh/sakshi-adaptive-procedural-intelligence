import uuid

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class AuditLog(Base):
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_module", "module"),
        Index("ix_audit_logs_entity_id", "entity_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module: Mapped[str] = mapped_column(String(120), nullable=False)
    action: Mapped[str] = mapped_column(String(120), nullable=False)
    user: Mapped[str] = mapped_column(String(140), nullable=False)
    userRole: Mapped[str] = mapped_column("user_role", String(80), nullable=False)
    entityId: Mapped[str] = mapped_column("entity_id", String(120), nullable=True)
    caseId: Mapped[uuid.UUID] = mapped_column("case_id", UUID(as_uuid=True), nullable=True)
    details: Mapped[str] = mapped_column(Text, nullable=True)
    ipAddress: Mapped[str] = mapped_column("ip_address", String(80), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="success")
    timestamp: Mapped[str] = mapped_column(String(80), nullable=False)
    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    createdBy: Mapped[uuid.UUID] = mapped_column("created_by", UUID(as_uuid=True), nullable=True)
    updatedBy: Mapped[uuid.UUID] = mapped_column("updated_by", UUID(as_uuid=True), nullable=True)
