import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class AccountabilityPassport(Base):
    __tablename__ = "accountability_passports"
    __table_args__ = (
        Index("ix_accountability_passports_case_id", "case_id"),
        Index("ix_accountability_passports_passport_id", "passport_id", unique=True),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    passportId: Mapped[str] = mapped_column("passport_id", String(120), unique=True, nullable=False)
    caseId: Mapped[uuid.UUID] = mapped_column("case_id", UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    caseReference: Mapped[str] = mapped_column("case_reference", String(120), nullable=False)
    generatedAt: Mapped[datetime] = mapped_column("generated_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    generatedBy: Mapped[str] = mapped_column("generated_by", String(140), nullable=False)
    generatedById: Mapped[uuid.UUID] = mapped_column("generated_by_id", UUID(as_uuid=True), nullable=False)
    
    proceduralState: Mapped[dict] = mapped_column("procedural_state", JSONB, nullable=False)
    obligationSummary: Mapped[dict] = mapped_column("obligation_summary", JSONB, nullable=False)
    auditVerification: Mapped[dict] = mapped_column("audit_verification", JSONB, nullable=False)
    
    integrityReference: Mapped[str] = mapped_column("integrity_reference", String(64), nullable=False)
    passportHash: Mapped[str] = mapped_column("passport_hash", String(64), nullable=False)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    case = relationship("Case")
