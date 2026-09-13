import uuid

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class EvidenceItem(Base):
    __tablename__ = "evidence"
    __table_args__ = (
        Index("ix_evidence_evidence_id", "evidence_id", unique=True),
        Index("ix_evidence_case_id", "case_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evidenceId: Mapped[str] = mapped_column("evidence_id", String(80), unique=True, nullable=False)
    caseId: Mapped[uuid.UUID] = mapped_column("case_id", UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    caseNumber: Mapped[str] = mapped_column("case_number", String(120), nullable=False)
    type: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    collectedBy: Mapped[str] = mapped_column("collected_by", String(140), nullable=False)
    collectedByRole: Mapped[str] = mapped_column("collected_by_role", String(120), nullable=False)
    agency: Mapped[str] = mapped_column(String(80), nullable=False)
    collectionDate: Mapped[str] = mapped_column("collection_date", String(80), nullable=False)
    collectionTime: Mapped[str] = mapped_column("collection_time", String(80), nullable=False)
    gpsLocation: Mapped[str] = mapped_column("gps_location", String(255), nullable=False)
    gpsCoords: Mapped[dict] = mapped_column("gps_coords", JSONB, nullable=False, default=dict)
    status: Mapped[str] = mapped_column(String(80), nullable=False, default="registered")
    currentCustody: Mapped[str] = mapped_column("current_custody", String(80), nullable=False)
    currentOfficer: Mapped[str] = mapped_column("current_officer", String(140), nullable=False)
    initialHash: Mapped[str] = mapped_column("initial_hash", String(255), nullable=False)
    currentHash: Mapped[str] = mapped_column("current_hash", String(255), nullable=False)
    verificationStatus: Mapped[str] = mapped_column("verification_status", String(80), nullable=False, default="pending")
    lastVerified: Mapped[str] = mapped_column("last_verified", String(80), nullable=True)
    evidenceToken: Mapped[str] = mapped_column("evidence_token", String(140), nullable=False)
    sealNumber: Mapped[str] = mapped_column("seal_number", String(120), nullable=False)
    weight: Mapped[str] = mapped_column(String(80), nullable=True)
    dimensions: Mapped[str] = mapped_column(String(80), nullable=True)
    photographs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    notes: Mapped[str] = mapped_column(Text, nullable=True, default="")
    chain: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    shares: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    auditLogs: Mapped[list] = mapped_column("audit_logs", JSONB, nullable=False, default=list)

    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    createdBy: Mapped[uuid.UUID] = mapped_column("created_by", UUID(as_uuid=True), nullable=True)
    updatedBy: Mapped[uuid.UUID] = mapped_column("updated_by", UUID(as_uuid=True), nullable=True)

    case = relationship("Case", back_populates="evidence_items")
    transfer_history = relationship("EvidenceTransfer", back_populates="evidence", cascade="all, delete-orphan")
    version_history = relationship("EvidenceVersion", back_populates="evidence", cascade="all, delete-orphan")
    integrity_records = relationship("EvidenceIntegrity", back_populates="evidence", cascade="all, delete-orphan")
