"""add engine_version to risk_assessments

Revision ID: 7b0001_add_engine_version
Revises: a1b2c3d4e5f6
Create Date: 2026-09-13 23:58:00.000000

Adds the engine_version column to risk_assessments that tracks which commit
of the risk formula produced this assessment.  The column was present in the
ORM model since Phase 7A but was never added to a migration, causing a schema
drift that makes all risk_assessment queries fail in tests.

Default: '523439d' (the Phase 7A formula commit hash).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7b0001_add_engine_version'
down_revision: Union[str, None] = '7bd0bde65aad'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'risk_assessments',
        sa.Column(
            'engine_version',
            sa.String(length=40),
            nullable=False,
            server_default='523439d',
            comment='Git commit hash of the risk formula that produced this assessment.',
        )
    )


def downgrade() -> None:
    op.drop_column('risk_assessments', 'engine_version')
