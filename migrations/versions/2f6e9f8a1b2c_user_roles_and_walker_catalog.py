"""add user roles and walker catalog

Revision ID: 2f6e9f8a1b2c
Revises: 0763d677d453
Create Date: 2026-08-26
"""
from alembic import op
import sqlalchemy as sa


revision = "2f6e9f8a1b2c"
down_revision = "0763d677d453"
branch_labels = None
depends_on = None


def upgrade():
    inspector = sa.inspect(op.get_bind())
    user_columns = {column["name"] for column in inspector.get_columns("user")}
    if "role" not in user_columns:
        op.add_column(
            "user",
            sa.Column("role", sa.String(length=20),
                      nullable=False, server_default="cliente"),
        )

    op.create_table(
        "service",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "zone",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("city", sa.String(length=100), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "pet_type",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=50), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_table(
        "walker_profile",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("experience_years", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["user.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id"),
    )
    op.create_table(
        "walker_availability",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("walker_id", sa.Integer(), nullable=False),
        sa.Column("day_of_week", sa.Integer(), nullable=False),
        sa.Column("start_time", sa.Time(), nullable=False),
        sa.Column("end_time", sa.Time(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.ForeignKeyConstraint(["walker_id"], ["walker_profile.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_table(
        "walker_services",
        sa.Column("walker_id", sa.Integer(), nullable=False),
        sa.Column("service_id", sa.Integer(), nullable=False),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["service_id"], ["service.id"]),
        sa.ForeignKeyConstraint(["walker_id"], ["walker_profile.id"]),
        sa.PrimaryKeyConstraint("walker_id", "service_id"),
    )
    op.create_table(
        "walker_zones",
        sa.Column("walker_id", sa.Integer(), nullable=False),
        sa.Column("zone_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["walker_id"], ["walker_profile.id"]),
        sa.ForeignKeyConstraint(["zone_id"], ["zone.id"]),
        sa.PrimaryKeyConstraint("walker_id", "zone_id"),
    )
    op.create_table(
        "walker_pet_types",
        sa.Column("walker_id", sa.Integer(), nullable=False),
        sa.Column("pet_type_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["pet_type_id"], ["pet_type.id"]),
        sa.ForeignKeyConstraint(["walker_id"], ["walker_profile.id"]),
        sa.PrimaryKeyConstraint("walker_id", "pet_type_id"),
    )


def downgrade():
    op.drop_table("walker_pet_types")
    op.drop_table("walker_zones")
    op.drop_table("walker_services")
    op.drop_table("walker_availability")
    op.drop_table("walker_profile")
    op.drop_table("pet_type")
    op.drop_table("zone")
    op.drop_table("service")
    op.drop_column("user", "role")
