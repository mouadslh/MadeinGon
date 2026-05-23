"""seller orders wallet notifications delivery

Revision ID: 003
Revises: 002
Create Date: 2026-05-20

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "003"
down_revision: Union[str, None] = "002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("orders", sa.Column("reference", sa.String(30), nullable=True))
    op.create_index("idx_orders_reference", "orders", ["reference"], unique=True)
    op.add_column("orders", sa.Column("cancel_reason", sa.Text(), nullable=True))
    op.add_column("orders", sa.Column("amana_tracking_number", sa.String(100), nullable=True))
    op.add_column("orders", sa.Column("amana_tracking_url", sa.Text(), nullable=True))
    op.add_column("orders", sa.Column("amana_status", sa.String(50), nullable=True))
    op.add_column("orders", sa.Column("amana_estimated_delivery", sa.Date(), nullable=True))
    op.add_column("orders", sa.Column("amana_shipment_id", sa.String(100), nullable=True))

    op.add_column("products", sa.Column("low_stock_threshold", sa.Integer(), server_default="5", nullable=False))
    op.add_column("products", sa.Column("stock_alert_sent", sa.Boolean(), server_default="false", nullable=False))

    op.create_table(
        "seller_wallets",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("seller_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False),
        sa.Column("total_earned", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("total_pending", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("total_paid_out", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("available", sa.Numeric(12, 2), server_default="0", nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )

    wallet_tx_enum = postgresql.ENUM("sale", "refund", "payout", "adjustment", name="wallet_tx_type_enum", create_type=False)
    wallet_tx_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "wallet_transactions",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("seller_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("order_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("orders.id"), nullable=True),
        sa.Column("type", wallet_tx_enum, nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("commission_rate", sa.Numeric(5, 4), server_default="0.05", nullable=False),
        sa.Column("net_amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("description", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("idx_wallet_tx_seller", "wallet_transactions", ["seller_id"])

    notif_enum = postgresql.ENUM(
        "new_order", "order_paid", "order_shipped", "order_delivered", "order_cancelled",
        "low_stock", "out_of_stock", "product_approved", "product_rejected", "new_review",
        name="notification_type_enum", create_type=False,
    )
    notif_enum.create(op.get_bind(), checkfirst=True)
    op.create_table(
        "notifications",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("seller_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", notif_enum, nullable=False),
        sa.Column("title", sa.String(100), nullable=False),
        sa.Column("body", sa.String(500), nullable=False),
        sa.Column("data", postgresql.JSONB(), nullable=True),
        sa.Column("is_read", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("idx_notifications_seller", "notifications", ["seller_id"])
    op.create_index("idx_notifications_unread", "notifications", ["seller_id", "is_read"])


def downgrade() -> None:
    op.drop_index("idx_notifications_unread", table_name="notifications")
    op.drop_index("idx_notifications_seller", table_name="notifications")
    op.drop_table("notifications")
    op.execute("DROP TYPE IF EXISTS notification_type_enum")

    op.drop_index("idx_wallet_tx_seller", table_name="wallet_transactions")
    op.drop_table("wallet_transactions")
    op.execute("DROP TYPE IF EXISTS wallet_tx_type_enum")

    op.drop_table("seller_wallets")

    op.drop_column("products", "stock_alert_sent")
    op.drop_column("products", "low_stock_threshold")

    op.drop_column("orders", "amana_shipment_id")
    op.drop_column("orders", "amana_estimated_delivery")
    op.drop_column("orders", "amana_status")
    op.drop_column("orders", "amana_tracking_url")
    op.drop_column("orders", "amana_tracking_number")
    op.drop_column("orders", "cancel_reason")
    op.drop_index("idx_orders_reference", table_name="orders")
    op.drop_column("orders", "reference")
