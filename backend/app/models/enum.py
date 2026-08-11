from enum import Enum

class UserRoles(str, Enum):
    ADMIN = "admin"
    CUSTOMER = "customer"
    READER = "reader"

class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPEND = "suspend"
    BANNED = "banned"

class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ASSIGNED = "assigned"
    COMPLETED = "completed"
    CANCELED = "canceled"
    REFUNDED = "refunded"
    IN_PROGRESS = "in_progress"
    DISPUTING = "disputing"
    
class DisputeStatus(str, Enum):
    OPEN = "open"
    REVIEWING = "reviewing"
    RESOLVED = "resolved"
    REJECTED = "rejected"
    
class DisputeVerdict(str, Enum):
    REFUND_FULL = "refund_full"
    REFUND_PARTIAL = "refund_partial"
    REJECTED = "rejected"

class DisputeMessageType(str, Enum):
    COMMENT = "comment"
    EVIDENCE = "evidence"
    SYSTEM = "system"