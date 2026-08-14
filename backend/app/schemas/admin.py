import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

class AdminUserPublic(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str
    status: str
    created_at: datetime
    updated_at: datetime
    last_active_at: datetime | None

    model_config = ConfigDict(from_attributes=True)


class UserRoleUpdate(BaseModel):
    role: Literal["admin", "customer", "reader"]


class UserStatusUpdate(BaseModel):
    status: Literal["active", "suspend", "banned"]