import uuid

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class WorkflowHistory(Base):
    __tablename__ = "workflow_history"
    __table_args__ = (
        Index("ix_workflow_history_case_id", "case_id"),
        Index("ix_workflow_history_workflow_id", "workflow_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caseId: Mapped[uuid.UUID] = mapped_column("case_id", UUID(as_uuid=True), ForeignKey("cases.id"), nullable=False)
    workflowId: Mapped[uuid.UUID] = mapped_column("workflow_id", UUID(as_uuid=True), ForeignKey("workflows.id"), nullable=False)
    previousStatus: Mapped[str] = mapped_column("previous_status", String(80), nullable=False)
    newStatus: Mapped[str] = mapped_column("new_status", String(80), nullable=False)
    changedBy: Mapped[str] = mapped_column("changed_by", String(140), nullable=False)
    changedAt: Mapped[str] = mapped_column("changed_at", String(80), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, nullable=True)
    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    createdBy: Mapped[uuid.UUID] = mapped_column("created_by", UUID(as_uuid=True), nullable=True)
    updatedBy: Mapped[uuid.UUID] = mapped_column("updated_by", UUID(as_uuid=True), nullable=True)

    case = relationship("Case")
    workflow = relationship("Workflow")
