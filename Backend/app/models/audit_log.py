import uuid

from sqlalchemy import DateTime, Index, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from datetime import datetime


class AuditLog(Base):
    """
    Audit log entry with cryptographic chain support.

    Each entry participates in a case-scoped (or SYSTEM-scoped) SHA-256 hash chain.
    - previous_hash: SHA-256 hex of the preceding entry in the same chain scope,
                     or "GENESIS" for the first entry, or "LEGACY" for pre-chain records.
    - event_hash:    SHA-256 hex computed over the canonical payload + previous_hash.
    """

    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_module", "module"),
        Index("ix_audit_logs_entity_id", "entity_id"),
        # Composite index used for deterministic chain retrieval per case scope
        Index("ix_audit_logs_case_id_created_at", "case_id", "created_at"),
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

    # ── Cryptographic chain fields ─────────────────────────────────────────────
    previousHash: Mapped[str] = mapped_column(
        "previous_hash",
        String(64),
        nullable=False,
        default="LEGACY",
        comment="SHA-256 of the previous event in chain, 'GENESIS' for first, 'LEGACY' for pre-chain rows.",
    )
    eventHash: Mapped[str] = mapped_column(
        "event_hash",
        String(64),
        nullable=False,
        default="LEGACY",
        comment="SHA-256(canonical_payload + '|' + previous_hash)",
    )

