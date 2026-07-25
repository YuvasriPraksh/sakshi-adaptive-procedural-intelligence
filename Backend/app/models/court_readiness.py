import uuid

from sqlalchemy import DateTime, ForeignKey, Index, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class CourtReadiness(Base):
    __tablename__ = "court_readiness"
    __table_args__ = (
        Index("ix_court_readiness_case_id", "case_id"),
        Index("ix_court_readiness_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caseId: Mapped[uuid.UUID] = mapped_column("case_id", UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(80), nullable=False)
    readinessPercent: Mapped[int] = mapped_column("readiness_percent", nullable=False)
    missingItems: Mapped[dict] = mapped_column("missing_items", JSON, nullable=False, default=list)
    recommendations: Mapped[dict] = mapped_column(JSON, nullable=False, default=list)
    generatedAt: Mapped[str] = mapped_column("generated_at", String(80), nullable=False)
    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    createdBy: Mapped[uuid.UUID] = mapped_column("created_by", UUID(as_uuid=True), nullable=True)
    updatedBy: Mapped[uuid.UUID] = mapped_column("updated_by", UUID(as_uuid=True), nullable=True)

    case = relationship("Case", back_populates="court_readiness")
