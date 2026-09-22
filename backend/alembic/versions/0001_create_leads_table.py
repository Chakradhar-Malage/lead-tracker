"""create leads table

Revision ID: 0001
Revises:
Create Date: 2026-09-22

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

lead_status_enum = sa.Enum(
    "NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST", name="lead_status"
)


def upgrade() -> None:
    lead_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "leads",
        sa.Column("id", sa.String(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=50), nullable=False),
        sa.Column("status", lead_status_enum, nullable=False, server_default="NEW"),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_leads_email", "leads", ["email"])


def downgrade() -> None:
    op.drop_index("ix_leads_email", table_name="leads")
    op.drop_table("leads")
    lead_status_enum.drop(op.get_bind(), checkfirst=True)
