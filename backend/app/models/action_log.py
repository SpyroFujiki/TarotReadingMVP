import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func, text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.models.user import User

class ActionLog(Base):
    __tablename__ = "action_logs"

    __table_args__ = (
        Index(
            "ix_action_logs_actor_id_created_at",
            "actor_id",
            "created_at",
        ),
        Index(
            "ix_action_logs_target_type_target_id",
            "target_type",
            "target_id",
        ),
        Index(
            "ix_action_logs_action_code",
            "action_code",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    actor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
    )
    actor: Mapped["User"] = relationship("User", back_populates="action_logs")

    target_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    target_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    action_code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    old_value: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    new_value: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )
    reason: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )