'''Table bookings {
  id uuid [pk, default: `gen_random_uuid()`]

  package_id uuid [not null, ref: > reading_packages.id]
  customer_id uuid [not null, ref: > users.id]
  reader_id uuid [ref: > users.id, note: 'Null khi đơn chưa được reader nhận']

  question text [not null]
  status booking_status [not null, default: 'pending']
  
  package_name_snapshot varchar(150) [not null, note: 'Tên gói tại thời điểm mua']
  price_snapshot int [not null, note: 'Giá gói tại thời điểm mua']
  expected_response_minutes_snapshot int [not null]

  paid_at timestamptz
  assigned_at timestamptz
  started_at timestamptz
  completed_at timestamptz
  cancelled_at timestamptz
  created_at timestamptz [not null, default: `now()`]
  updated_at timestamptz [not null, default: `now()`]

  Indexes {
    (customer_id, status)
    (reader_id, status)
    (status, created_at)
    (payment_status)
  }
}'''

import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enum import BookingStatus
from app.models.reading_package import ReadingPackage
from app.models.user import User

class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    package_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    package: Mapped["ReadingPackage"] = relationship(
        "ReadingPackage",
        back_populates="bookings",
        lazy="joined",
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    customer: Mapped["User"] = relationship(
        "User",
        foreign_keys=[customer_id],
        back_populates="customer_bookings",
        lazy="joined",
    )

    reader_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=True,
    )
    reader: Mapped["User"] = relationship(
        "User",
        foreign_keys=[reader_id],
        back_populates="reader_bookings",
        lazy="joined",
    )

    question: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    status: Mapped[BookingStatus] = mapped_column(
        BookingStatus,
        nullable=False,
        default=BookingStatus.PENDING,
        server_default=BookingStatus.PENDING.value,
    )

    package_name_snapshot: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    
    price_snapshot: Mapped[int] = mapped_column(
        int,
        nullable=False
    )
    
    expected_response_minutes_snapshot: Mapped[int] = mapped_column(
        int,
        nullable=False
    )
    
    paid_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    completed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    cancelled_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=text("now()"),