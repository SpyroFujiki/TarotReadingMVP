import uuid

from pydantic import BaseModel, ConfigDict


class ReadingPackagePublic(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    price: int
    expected_response_minutes: int
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
