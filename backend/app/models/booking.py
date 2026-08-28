import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, text, func, Index, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enum import BookingStatus
from app.models.reading_package import ReadingPackage
from app.models.user import User

from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from app.models.dispute import Dispute
    from app.models.service_message import ServiceMessage

class Booking(Base):
    __tablename__ = "bookings"

    __table_args__ = (
        Index("ix_bookings_customer_id_status", "customer_id", "status"),
        Index("ix_bookings_reader_id_status", "reader_id", "status"),
        Index("ix_bookings_status_created_at", "status", "created_at"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("gen_random_uuid()"),
    )

    package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("reading_packages.id"),
        nullable=False,
    )
    package: Mapped["ReadingPackage"] = relationship(
        "ReadingPackage",
        back_populates="bookings",
        lazy="joined",
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    customer: Mapped["User"] = relationship(
        "User",
        foreign_keys=[customer_id],
        back_populates="customer_bookings",
        lazy="joined",
    )

    reader_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    reader: Mapped["User"] = relationship(
        "User",
        foreign_keys=[reader_id],
        back_populates="reader_bookings",
        lazy="joined",
    )

    topic: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )

    status: Mapped[BookingStatus] = mapped_column(
        SQLEnum(
            BookingStatus, 
            name="booking_status",
            values_callable = lambda enum_class: [member.value for member in enum_class]),
        nullable=False,
        default=BookingStatus.PENDING,
        server_default=BookingStatus.PENDING.value,
    )

    package_name_snapshot: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    
    price_snapshot: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    
    expected_response_minutes_snapshot: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    
    paid_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    assigned_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    cancelled_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),
        onupdate=func.now(),
    )

    dispute: Mapped["Dispute | None"] = relationship(
        "Dispute",
        back_populates="booking",
        uselist=False,
    )

    service_messages: Mapped[list["ServiceMessage"]] = relationship(
        "ServiceMessage",
        back_populates="booking",
    )