import uuid

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, Boolean, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class EvidenceIntegrity(Base):
    __tablename__ = "evidence_integrity"
    __table_args__ = (
        Index("ix_evidence_integrity_evidence_id", "evidence_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("evidence.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(80), nullable=False)
    hash_match: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    details: Mapped[str] = mapped_column(Text, nullable=True)
    verified_at: Mapped[str] = mapped_column(String(80), nullable=False)
    verified_by: Mapped[str] = mapped_column(String(140), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)

    evidence = relationship("EvidenceItem", back_populates="integrity_records")
