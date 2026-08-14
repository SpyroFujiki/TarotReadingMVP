import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class AdminInfoForAudit(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str

    model_config = ConfigDict(from_attributes=True)


class AdminAuditLogPublic(BaseModel):
    id: uuid.UUID
    admin: AdminInfoForAudit
    action: str
    target_type: str
    target_id: uuid.UUID
    old_value: str | None
    new_value: str
    reason: str | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
