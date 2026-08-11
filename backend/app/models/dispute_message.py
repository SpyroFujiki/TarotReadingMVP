import uuid
from datetime import datetime

from sqlalchemy import DateTime, String, Text, text, func, Index, ForeignKey, Integer, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.dispute import Dispute
from app.models.enum import DisputeMessageType
from app.models.user import User

class DisputeMessage(Base):
    __tablename__ = "dispute_messages"

    __table_args__ = (
        Index("ix_dispute_messages_dispute_id_created_at", "dispute_id", "created_at"),
        Index("ix_dispute_messages_sender_id", "sender_id"),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    dispute_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("disputes.id"),
        nullable=False,
    )
    dispute: Mapped["Dispute"] = relationship(
        "Dispute",
        back_populates="messages",
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
        back_populates="sent_dispute_messages",
        lazy="joined",
    )

    type: Mapped[DisputeMessageType] = mapped_column(
        SQLEnum(
            DisputeMessageType, 
            name="dispute_message_type",
            values_callable = lambda enum_class: [member.value for member in enum_class],
        ),
        nullable=False,
        default=DisputeMessageType.COMMENT,
        server_default=text("'comment'::dispute_message_type"),
    )

    content: Mapped[str] = mapped_column(
        Text,
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