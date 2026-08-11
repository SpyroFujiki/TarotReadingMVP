import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, text, func, Index, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.booking import Booking
from app.models.user import User

class ServiceMessage(Base):
    __tablename__ = "service_messages"

    __table_args__ = (
        Index("ix_service_messages_booking_id_created_at", "booking_id", "created_at"),
        Index("ix_service_messages_sender_id", "sender_id"),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id"),
        nullable=False,
    )
    booking: Mapped["Booking"] = relationship(
        "Booking",
        back_populates="service_messages",
        lazy="joined",
    )

    sender_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    sender: Mapped["User"] = relationship(
        "User",
        foreign_keys=[sender_id],
        back_populates="sent_service_messages",
        lazy="joined",
    )

    content: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    file_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )