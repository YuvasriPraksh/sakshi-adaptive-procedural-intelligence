import uuid

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from datetime import datetime


class Case(Base):
    __tablename__ = "cases"
    __table_args__ = (
        Index("ix_cases_case_number", "case_number", unique=True),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    caseNumber: Mapped[str] = mapped_column("case_number", String(120), unique=True, nullable=False)
    firNumber: Mapped[str] = mapped_column("fir_number", String(120), nullable=False)
    crimeType: Mapped[str] = mapped_column("crime_type", String(80), nullable=False)
    victimCode: Mapped[str] = mapped_column("victim_code", String(80), nullable=False)
    victimAge: Mapped[int] = mapped_column("victim_age", Integer, nullable=False)
    victimGender: Mapped[str] = mapped_column("victim_gender", String(10), nullable=False)
    incidentDate: Mapped[str] = mapped_column("incident_date", String(80), nullable=False)
    incidentLocation: Mapped[str] = mapped_column("incident_location", String(255), nullable=False)
    district: Mapped[str] = mapped_column(String(120), nullable=False)
    state: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(60), nullable=False, default="registered")
    priority: Mapped[str] = mapped_column(String(60), nullable=False, default="medium")
    currentStage: Mapped[str] = mapped_column("current_stage", String(140), nullable=False, default="Registration")
    currentStageOrder: Mapped[int] = mapped_column("current_stage_order", Integer, nullable=False, default=1)
    totalStages: Mapped[int] = mapped_column("total_stages", Integer, nullable=False, default=1)
    assignedOfficerId: Mapped[uuid.UUID] = mapped_column("assigned_officer_id", UUID(as_uuid=True), nullable=True)
    assignedOfficer: Mapped[str] = mapped_column("assigned_officer", String(140), nullable=True)
    assignedStation: Mapped[str] = mapped_column("assigned_station", String(140), nullable=True)
    remarks: Mapped[str] = mapped_column(Text, nullable=True, default="")
    workflow: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)
    documents: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    createdAt: Mapped[datetime] = mapped_column("created_at", DateTime(timezone=True), server_default=func.now(), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column("updated_at", DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    createdBy: Mapped[uuid.UUID] = mapped_column("created_by", UUID(as_uuid=True), nullable=True)
    updatedBy: Mapped[uuid.UUID] = mapped_column("updated_by", UUID(as_uuid=True), nullable=True)

    document_records = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    transfers = relationship("EvidenceTransfer", back_populates="case", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="case", cascade="all, delete-orphan")
    risk_assessments = relationship("RiskAssessment", back_populates="case", cascade="all, delete-orphan")
    court_readiness = relationship("CourtReadiness", back_populates="case", cascade="all, delete-orphan")
    workflow_stages = relationship("Workflow", back_populates="case", cascade="all, delete-orphan")
    workflow_history = relationship("WorkflowHistory", back_populates="case", cascade="all, delete-orphan")
    evidence_items = relationship("EvidenceItem", back_populates="case", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="case", cascade="all, delete-orphan")
