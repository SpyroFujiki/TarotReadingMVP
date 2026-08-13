"""remove confirmed from booking_status enum

Revision ID: 5c2d9f8e1234
Revises: 4b18e6ce2678
Create Date: 2026-08-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5c2d9f8e1234"
down_revision: Union[str, Sequence[str], None] = "4b18e6ce2678"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # First, create a new enum type with the updated values (without 'confirmed')
    op.execute("""
        CREATE TYPE booking_status_new AS ENUM (
            'pending', 'assigned', 'completed', 'canceled', 'refunded', 'in_progress', 'disputing'
        )
    """)
    
    # Remove the default value constraint from the column
    op.alter_column(
        "bookings",
        "status",
        server_default=None,
    )
    
    # Alter the column to use text temporarily
    op.alter_column(
        "bookings",
        "status",
        type_=sa.String(),
        existing_type=sa.Enum('pending', 'confirmed', 'assigned', 'completed', 'canceled', 'refunded', 'in_progress', 'disputing', name='booking_status'),
    )
    
    # Convert back to the new enum type
    op.execute("ALTER TABLE bookings ALTER COLUMN status TYPE booking_status_new USING status::booking_status_new")
    
    # Set the new default value
    op.alter_column(
        "bookings",
        "status",
        server_default="pending",
    )
    
    # Drop the old enum type
    op.execute("DROP TYPE booking_status")
    
    # Rename the new enum type to the original name
    op.execute("ALTER TYPE booking_status_new RENAME TO booking_status")


def downgrade() -> None:
    # First, create the old enum type with 'confirmed'
    op.execute("""
        CREATE TYPE booking_status_old AS ENUM (
            'pending', 'confirmed', 'assigned', 'completed', 'canceled', 'refunded', 'in_progress', 'disputing'
        )
    """)
    
    # Remove the default value constraint from the column
    op.alter_column(
        "bookings",
        "status",
        server_default=None,
    )
    
    # Alter the column to use text temporarily
    op.alter_column(
        "bookings",
        "status",
        type_=sa.String(),
        existing_type=sa.Enum('pending', 'assigned', 'completed', 'canceled', 'refunded', 'in_progress', 'disputing', name='booking_status'),
    )
    
    # Convert back to the old enum type
    op.execute("ALTER TABLE bookings ALTER COLUMN status TYPE booking_status_old USING status::booking_status_old")
    
    # Set the old default value
    op.alter_column(
        "bookings",
        "status",
        server_default="pending",
    )
    
    # Drop the new enum type
    op.execute("DROP TYPE booking_status")
    
    # Rename the old enum type back to the original name
    op.execute("ALTER TYPE booking_status_old RENAME TO booking_status")
