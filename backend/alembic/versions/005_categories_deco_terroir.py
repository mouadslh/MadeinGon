"""Add deco and terroir categories if missing

Revision ID: 005
Revises: 004
Create Date: 2026-05-24

"""
from typing import Sequence, Union

from alembic import op

revision: str = "005"
down_revision: Union[str, None] = "004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        INSERT INTO categories (slug, name_fr, name_ar, sort_order) VALUES
        ('deco', 'Décoration', 'الديكور', 6),
        ('terroir', 'Terroir', 'منتجات المنطقة', 7)
        ON CONFLICT (slug) DO NOTHING
    """)


def downgrade() -> None:
    op.execute("DELETE FROM categories WHERE slug IN ('deco', 'terroir')")
