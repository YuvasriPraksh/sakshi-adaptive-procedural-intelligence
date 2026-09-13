"""add audit chain fields

Revision ID: a1b2c3d4e5f6
Revises: 9511e8f8df9f
Create Date: 2026-09-13 19:49:00.000000

Adds two cryptographic chain columns to audit_logs:
  - previous_hash: SHA-256 hex of the preceding event in the same chain scope,
                   "GENESIS" for the first event, "LEGACY" for pre-chain records.
  - event_hash:    SHA-256 hex of this event's canonical payload + previous_hash.

Also adds a composite index (case_id, created_at) for efficient chain retrieval.

Backfill strategy:
  Existing records are marked with previous_hash = 'LEGACY' and event_hash = 'LEGACY'.
  These records predate the chain and cannot be retroactively chained without
  ambiguity (the original insertion order and payload state at creation time
  cannot be guaranteed). Only events created after this migration will participate
  in the verified chain. This is the correct and honest approach.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, None] = '9511e8f8df9f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add previous_hash column — default LEGACY for existing rows
    op.add_column(
        'audit_logs',
        sa.Column(
            'previous_hash',
            sa.String(length=64),
            nullable=False,
            server_default='LEGACY',
            comment="SHA-256 of the previous event in chain, 'GENESIS' for first, 'LEGACY' for pre-chain rows.",
        )
    )
    # Add event_hash column — default LEGACY for existing rows
    op.add_column(
        'audit_logs',
        sa.Column(
            'event_hash',
            sa.String(length=64),
            nullable=False,
            server_default='LEGACY',
            comment="SHA-256(canonical_payload + '|' + previous_hash)",
        )
    )
    # Composite index for chain retrieval ordered by case scope + time
    op.create_index(
        'ix_audit_logs_case_id_created_at',
        'audit_logs',
        ['case_id', 'created_at'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index('ix_audit_logs_case_id_created_at', table_name='audit_logs')
    op.drop_column('audit_logs', 'event_hash')
    op.drop_column('audit_logs', 'previous_hash')
