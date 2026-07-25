import uuid

from sqlalchemy import DateTime, ForeignKey, Index, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class Report(Base):
    __tablename__ = "reports"
    __table_args__ = (
        Index("ix_reports_case_id", "case_id"),
        Index("ix_reports_type", "report_type"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caseId: Mapped[uuid.UUID] = mapped_column("case_id", UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    reportType: Mapped[str] = mapped_column("report_type", String(120), nullable=False)
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    contents: Mapped[dict] = mapped_column(JSON, nullable=False, default=dict)
    issuedBy: Mapped[str] = mapped_column("issued_by", String(140), nullable=False)
    issuedAt: Mapped[str] = mapped_column("issued_at", String(80), nullable=False)
    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    createdBy: Mapped[uuid.UUID] = mapped_column("created_by", UUID(as_uuid=True), nullable=True)
    updatedBy: Mapped[uuid.UUID] = mapped_column("updated_by", UUID(as_uuid=True), nullable=True)

    case = relationship("Case", back_populates="reports")
