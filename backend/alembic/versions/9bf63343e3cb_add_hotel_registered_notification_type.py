"""add_hotel_registered_notification_type

Revision ID: 9bf63343e3cb
Revises: ef8add809de8
Create Date: 2026-06-22 23:10:46.415281

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9bf63343e3cb'
down_revision: Union[str, Sequence[str], None] = 'ef8add809de8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE notificationtype ADD VALUE 'hotel_registered'")


def downgrade() -> None:
    # PostgreSQL does not support removing a value from an enum. This is a no‑op.
    pass
