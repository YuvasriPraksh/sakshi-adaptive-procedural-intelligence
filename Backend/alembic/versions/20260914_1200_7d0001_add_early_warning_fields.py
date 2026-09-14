"""add category event_code details_json to notifications

Revision ID: 7d0001_add_early_warning_fields
Revises: 7b0001_add_engine_version
Create Date: 2026-09-14 12:00:00.000000

Adds category, event_code, and details_json columns to notifications table
for Phase 7D Procedural Early-Warning & Notification Intelligence.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d0001_add_early_warning_fields'
down_revision: Union[str, None] = '7b0001_add_engine_version'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'notifications',
        sa.Column(
            'category',
            sa.String(length=50),
            nullable=False,
            server_default='general',
            comment='Notification classification: early_warning, risk, deadline, workflow',
        )
    )
    op.add_column(
        'notifications',
        sa.Column(
            'event_code',
            sa.String(length=80),
            nullable=True,
            comment='Structured event code, e.g. EARLY_WARN_HIGH_RISK',
        )
    )
    op.add_column(
        'notifications',
        sa.Column(
            'details_json',
            sa.JSON(),
            nullable=True,
            comment='Event metadata payload containing delta, previous state, affected stages',
        )
    )


def downgrade() -> None:
    op.drop_column('notifications', 'details_json')
    op.drop_column('notifications', 'event_code')
    op.drop_column('notifications', 'category')
