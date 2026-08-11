import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum as SQLEnum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.enum import DisputeStatus, DisputeVerdict

if TYPE_CHECKING:
    from app.models.booking import Booking
    from app.models.user import User
    from app.models.dispute_message import DisputeMessage


def enum_values(enum_class: type) -> list[str]:
    return [member.value for member in enum_class]


class Dispute(Base):
    __tablename__ = "disputes"

    __table_args__ = (
        Index(
            "ix_disputes_status_created_at",
            "status",
            "created_at",
        ),
        Index(
            "ix_disputes_admin_id_status",
            "admin_id",
            "status",
        ),
        CheckConstraint(
            "refund_amount IS NULL OR refund_amount >= 0",
            name="ck_disputes_refund_amount_non_negative",
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        server_default=text("uuidv7()"),
    )

    booking_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("bookings.id"),
        nullable=False,
        unique=True,
    )

    raised_by_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )

    admin_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    reason_category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    status: Mapped[DisputeStatus] = mapped_column(
        SQLEnum(
            DisputeStatus,
            name="dispute_status",
            values_callable=enum_values,
        ),
        nullable=False,
        default=DisputeStatus.OPEN,
        server_default=DisputeStatus.OPEN.value,
    )

    verdict: Mapped[DisputeVerdict | None] = mapped_column(
        SQLEnum(
            DisputeVerdict,
            name="dispute_verdict",
            values_callable=enum_values,
        ),
        nullable=True,
    )

    refund_amount: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    resolution_note: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    reviewed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    resolved_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    booking: Mapped["Booking"] = relationship(
        back_populates="dispute",
    )

    raised_by: Mapped["User"] = relationship(
        foreign_keys=[raised_by_id],
        back_populates="raised_disputes",
    )

    admin: Mapped["User | None"] = relationship(
        foreign_keys=[admin_id],
        back_populates="handled_disputes",
    )

    messages: Mapped[list["DisputeMessage"]] = relationship(
        "DisputeMessage",
        back_populates="dispute",
    )