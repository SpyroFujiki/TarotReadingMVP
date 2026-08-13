"""rename question to topic in bookings

Revision ID: 4b18e6ce2678
Revises: 8f61a83e90b4
Create Date: 2026-08-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4b18e6ce2678"
down_revision: Union[str, Sequence[str], None] = "8f61a83e90b4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "bookings",
        "question",
        new_column_name="topic",
        existing_type=sa.String(length=500),
        type_=sa.String(length=150),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "bookings",
        "topic",
        new_column_name="question",
        existing_type=sa.String(length=150),
        type_=sa.String(length=500),
        existing_nullable=False,
    )
