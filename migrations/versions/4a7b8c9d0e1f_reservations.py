"""add reservations

Revision ID: 4a7b8c9d0e1f
Revises: 2f6e9f8a1b2c
Create Date: 2026-08-26
"""
from alembic import op
import sqlalchemy as sa


revision = "4a7b8c9d0e1f"
down_revision = "2f6e9f8a1b2c"
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "reservation",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("client_id", sa.Integer(), nullable=False),
        sa.Column("walker_id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=False),
        sa.Column("reservation_date", sa.Date(), nullable=False),
        sa.Column("reservation_time", sa.Time(), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.ForeignKeyConstraint(["client_id"], ["user.id"]),
        sa.ForeignKeyConstraint(["service_id"], ["service.id"]),
        sa.ForeignKeyConstraint(["walker_id"], ["walker_profile.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade():
    op.drop_table("reservation")
