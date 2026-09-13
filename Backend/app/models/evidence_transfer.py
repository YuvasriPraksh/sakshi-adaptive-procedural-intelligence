import uuid

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class EvidenceTransfer(Base):
    __tablename__ = "evidence_transfers"
    __table_args__ = (
        Index("ix_evidence_transfers_evidence_id", "evidence_id"),
        Index("ix_evidence_transfers_case_id", "case_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidence_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("evidence.id"), nullable=False)
    case_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    from_agency: Mapped[str] = mapped_column(String(80), nullable=False)
    to_agency: Mapped[str] = mapped_column(String(80), nullable=False)
    officer: Mapped[str] = mapped_column(String(140), nullable=False)
    officer_role: Mapped[str] = mapped_column(String(120), nullable=False)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    transfer_id: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    hash_before: Mapped[str] = mapped_column(String(255), nullable=True)
    hash_after: Mapped[str] = mapped_column(String(255), nullable=True)
    digital_signature: Mapped[str] = mapped_column(String(255), nullable=False)
    verification_status: Mapped[str] = mapped_column(String(80), nullable=False, default="pending")
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    timestamp: Mapped[str] = mapped_column(String(80), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)
    updated_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=True)

    evidence = relationship("EvidenceItem", back_populates="transfer_history")
    case = relationship("Case", back_populates="transfers")
