import uuid
from datetime import datetime

from sqlalchemy import (
    DateTime,
    Index,
    String,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.service_message import ServiceMessage
    from app.models.action_log import ActionLog
    from app.models.dispute import Dispute
    from app.models.dispute_message import DisputeMessage

class User(Base):
    __tablename__ = "users"

    __table_args__ = (
        Index(
            "ix_users_role_status",
            "role",
            "status",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    role: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="customer",
        server_default="customer",
    )

    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="active",
        server_default="active",
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    last_active_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    customer_bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        foreign_keys="Booking.customer_id",
        back_populates="customer",
    )

    reader_bookings: Mapped[list["Booking"]] = relationship(
        "Booking",
        foreign_keys="Booking.reader_id",
        back_populates="reader",
    )

    raised_disputes: Mapped[list["Dispute"]] = relationship(
        "Dispute",
        foreign_keys="Dispute.raised_by_id",
        back_populates="raised_by",
    )

    handled_disputes: Mapped[list["Dispute"]] = relationship(
        "Dispute",
        foreign_keys="Dispute.admin_id",
        back_populates="admin",
    )

    sent_service_messages: Mapped[list["ServiceMessage"]] = relationship(
        "ServiceMessage",
        foreign_keys="ServiceMessage.sender_id",
        back_populates="sender",
    )

    sent_dispute_messages: Mapped[list["DisputeMessage"]] = relationship(
        "DisputeMessage",
        foreign_keys="DisputeMessage.sender_id",
        back_populates="sender",
    )

    action_logs: Mapped[list["ActionLog"]] = relationship(
        "ActionLog",
        back_populates="actor",
    )