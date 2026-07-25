import uuid

from sqlalchemy import DateTime, ForeignKey, Index, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"
    __table_args__ = (
        Index("ix_risk_assessments_case_id", "case_id"),
        Index("ix_risk_assessments_risk_level", "risk_level"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caseId: Mapped[uuid.UUID] = mapped_column("case_id", UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    riskLevel: Mapped[str] = mapped_column("risk_level", String(80), nullable=False)
    riskScore: Mapped[int] = mapped_column("risk_score", nullable=False)
    riskFactors: Mapped[dict] = mapped_column("risk_factors", JSON, nullable=False, default=list)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    generatedAt: Mapped[str] = mapped_column("generated_at", String(80), nullable=False)
    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    createdBy: Mapped[uuid.UUID] = mapped_column("created_by", UUID(as_uuid=True), nullable=True)
    updatedBy: Mapped[uuid.UUID] = mapped_column("updated_by", UUID(as_uuid=True), nullable=True)

    case = relationship("Case", back_populates="risk_assessments")
