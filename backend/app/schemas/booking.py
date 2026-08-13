import uuid
from datetime import datetime

from pydantic import BaseModel, Field, ConfigDict

from app.models.enum import BookingStatus

class BookingCreate(BaseModel):
    package_id: uuid.UUID
    topic: str = Field(..., max_length=150)
    
class BookingPublic(BaseModel):
    id: uuid.UUID
    package_id: uuid.UUID
    customer_id: uuid.UUID
    reader_id: uuid.UUID | None
    
    topic: str
    status: BookingStatus
    
    package_name_snapshot: str
    price_snapshot: int
    expected_response_minutes_snapshot: int
    
    paid_at: datetime | None
    assigned_at: datetime | None
    completed_at: datetime | None
    cancelled_at: datetime | None
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)