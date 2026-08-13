import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

from app.models.enum import DisputeMessageType


class DisputeMessageCreate(BaseModel):
    type: Literal["comment", "evidence"] = "comment"
    content: str = Field(
        min_length=1,
        max_length=2000,
    )


class DisputeMessagePublic(BaseModel):
    id: int
    dispute_id: uuid.UUID
    sender_id: uuid.UUID
    type: DisputeMessageType
    content: str
    file_url: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)