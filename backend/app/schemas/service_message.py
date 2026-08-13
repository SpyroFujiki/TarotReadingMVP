import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ServiceMessageCreate(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=500,
    )

class ServiceMessagePublic(BaseModel):
    id: int
    booking_id: uuid.UUID
    sender_id: uuid.UUID
    content: str
    file_url: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)