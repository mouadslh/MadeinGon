"""add moderation fields and chat

Revision ID: 002
Revises: 001
Create Date: 2026-05-20
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy import inspect

revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    insp = inspect(bind)

    product_status = sa.Enum("pending", "approved", "rejected", name="product_status_enum")
    seller_status = sa.Enum("pending", "active", "suspended", name="seller_status_enum")
    review_status = sa.Enum("published", "flagged", "removed", name="review_status_enum")
    product_status.create(bind, checkfirst=True)
    seller_status.create(bind, checkfirst=True)
    review_status.create(bind, checkfirst=True)

    product_cols = {c["name"] for c in insp.get_columns("products")}
    user_cols = {c["name"] for c in insp.get_columns("users")}
    review_cols = {c["name"] for c in insp.get_columns("reviews")}

    if "status" not in product_cols:
        op.add_column("products", sa.Column("status", product_status, nullable=False, server_default="pending"))
    if "moderation_note" not in product_cols:
        op.add_column("products", sa.Column("moderation_note", sa.Text(), nullable=True))
    if "seller_status" not in user_cols:
        op.add_column("users", sa.Column("seller_status", seller_status, nullable=True))
    if "review_status" not in review_cols:
        op.add_column("reviews", sa.Column("review_status", review_status, nullable=False, server_default="published"))

    op.execute(
        "UPDATE products SET status = CASE WHEN is_moderated THEN 'approved'::product_status_enum ELSE 'pending'::product_status_enum END"
    )
    op.execute("UPDATE users SET seller_status = 'active'::seller_status_enum WHERE role = 'SELLER' AND seller_status IS NULL")


def downgrade() -> None:
    op.drop_column("reviews", "review_status")
    op.drop_column("users", "seller_status")
    op.drop_column("products", "moderation_note")
    op.drop_column("products", "status")

    sa.Enum(name="review_status_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="seller_status_enum").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="product_status_enum").drop(op.get_bind(), checkfirst=True)
