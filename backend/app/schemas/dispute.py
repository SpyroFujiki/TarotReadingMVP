import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.enum import DisputeStatus, DisputeVerdict, DisputeReasonCategory


class DisputeCreate(BaseModel):
    reason_category: DisputeReasonCategory

    description: str = Field(
        min_length=10,
        max_length=2000,
    )


class DisputeResolve(BaseModel):
    verdict: DisputeVerdict

    refund_amount: int | None = Field(
        default=None,
        ge=0,
    )

    resolution_note: str = Field(
        min_length=5,
        max_length=2000,
    )


class DisputePublic(BaseModel):
    id: uuid.UUID
    booking_id: uuid.UUID
    raised_by_id: uuid.UUID
    admin_id: uuid.UUID | None

    reason_category: DisputeReasonCategory
    description: str
    status: DisputeStatus
    verdict: DisputeVerdict | None
    refund_amount: int | None
    resolution_note: str | None

    created_at: datetime
    reviewed_at: datetime | None
    resolved_at: datetime | None

    model_config = ConfigDict(from_attributes=True)