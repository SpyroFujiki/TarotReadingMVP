import uuid
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update, func
from sqlalchemy.orm import Session

from app.api.dependencies import require_minimum_role
from app.db.dependencies import get_db
from app.models.booking import Booking
from app.models.dispute import Dispute
from app.models.enum import DisputeStatus, DisputeVerdict, BookingStatus
from app.models.user import User
from app.models.audit import AdminAuditLog

from app.schemas.dispute import DisputePublic, DisputeResolve
from app.schemas.admin import AdminUserPublic, UserRoleUpdate, UserStatusUpdate
from app.schemas.audit import AdminAuditLogPublic

router = APIRouter(prefix="/admin", tags=["admin"])

def log_audit(
    db: Session,
    admin_id: uuid.UUID,
    action: str,
    target_type: str,
    target_id: uuid.UUID,
    new_value: str,
    old_value: str | None = None,
    reason: str | None = None,
) -> None:
    """Ghi lại hành động của admin"""
    audit_log = AdminAuditLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        old_value=old_value,
        new_value=new_value,
        reason=reason,
    )
    db.add(audit_log)

@router.get(
    "/disputes",
    response_model=list[DisputePublic],
)
def list_admin_disputes(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_minimum_role("admin")
    ),
) -> list[Dispute]:
    disputes = db.scalars(
        select(Dispute)
        .where(
            Dispute.status.in_([
                DisputeStatus.OPEN,
                DisputeStatus.REVIEWING,
            ])
        )
        .order_by(Dispute.created_at.asc())
    ).all()

    return list(disputes)

@router.post(
    "/disputes/{dispute_id}/claim",
    response_model=DisputePublic,
)
def claim_dispute(
    dispute_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_minimum_role("admin")
    ),
) -> Dispute:
    now = datetime.now(timezone.utc)

    claimed_dispute_id = db.scalar(
        update(Dispute)
        .where(
            Dispute.id == dispute_id,
            Dispute.status == DisputeStatus.OPEN,
            Dispute.admin_id.is_(None),
        )
        .values(
            admin_id=current_user.id,
            status=DisputeStatus.REVIEWING,
            reviewed_at=now,
        )
        .returning(Dispute.id)
    )

    if claimed_dispute_id is None:
        db.rollback()

        existing_dispute = db.get(Dispute, dispute_id)

        if existing_dispute is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy khiếu nại.",
            )

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Khiếu nại đã được admin khác nhận.",
        )

    log_audit(
        db=db,
        admin_id=current_user.id,
        action="claim",
        target_type="dispute",
        target_id=claimed_dispute_id,
        old_value=json.dumps({"status": DisputeStatus.OPEN, "admin_id": None}),
        new_value=json.dumps({"status": DisputeStatus.REVIEWING, "admin_id": str(current_user.id)}),
    )

    db.commit()

    dispute = db.get(Dispute, claimed_dispute_id)

    if dispute is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khiếu nại.",
        )

    return dispute


@router.post(
    "/disputes/{dispute_id}/resolve",
    response_model=DisputePublic,
)
def resolve_dispute(
    dispute_id: uuid.UUID,
    payload: DisputeResolve,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_minimum_role("admin")
    ),
) -> Dispute:
    
    dispute = db.get(Dispute, dispute_id)

    if dispute is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khiếu nại.",
        )

    if dispute.status == DisputeStatus.OPEN:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Admin phải nhận khiếu nại trước khi giải quyết.",
        )

    if dispute.status != DisputeStatus.REVIEWING:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Khiếu nại không ở trạng thái đang xem xét.",
        )

    if dispute.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Khiếu nại đang do admin khác phụ trách.",
        )

    booking = dispute.booking
    refund_amount = payload.refund_amount

    if payload.verdict == DisputeVerdict.REJECTED:
        if refund_amount not in {None, 0}:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Khi từ chối khiếu nại thì không được hoàn tiền.",
            )

        refund_amount = None

    elif payload.verdict == DisputeVerdict.REFUND_FULL:
        if refund_amount != booking.price_snapshot:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Số tiền hoàn toàn phần phải bằng giá booking.",
            )

    elif payload.verdict == DisputeVerdict.REFUND_PARTIAL:
        if (
            refund_amount is None
            or refund_amount <= 0
            or refund_amount >= booking.price_snapshot
        ):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=(
                    "Tiền hoàn một phần phải lớn hơn 0 "
                    "và nhỏ hơn giá booking."
                ),
            )

    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Kết quả xử lý khiếu nại không hợp lệ.",
        )

    resolution_note = payload.resolution_note.strip()

    if not resolution_note:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Ghi chú xử lý không được để trống.",
        )

    now = datetime.now(timezone.utc)

    old_dispute_value = {
        "status": str(dispute.status),
        "verdict": None,
        "refund_amount": None,
    }

    dispute.status = DisputeStatus.RESOLVED
    dispute.verdict = payload.verdict
    dispute.refund_amount = refund_amount
    dispute.resolution_note = resolution_note
    dispute.resolved_at = now

    if payload.verdict == DisputeVerdict.REJECTED:
        booking.status = BookingStatus.COMPLETED

        booking.completed_at = booking.completed_at or now

    elif payload.verdict in {
        DisputeVerdict.REFUND_FULL,
        DisputeVerdict.REFUND_PARTIAL,
    }:
        booking.status = BookingStatus.REFUNDED

    booking.updated_at = now

    log_audit(
        db=db,
        admin_id=current_user.id,
        action="resolve",
        target_type="dispute",
        target_id=dispute_id,
        old_value=json.dumps(old_dispute_value),
        new_value=json.dumps({
            "status": str(DisputeStatus.RESOLVED),
            "verdict": str(payload.verdict),
            "refund_amount": refund_amount,
        }),
        reason=resolution_note,
    )
    
    db.commit()
    db.refresh(dispute)

    return dispute

def get_existed_user(
    user_id: uuid.UUID,
    db: Session,
) -> User:
    user = db.get(User, user_id)
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy người dùng."
        )
        
    return user

def ensure_admin_change_allowed(
    target_user: User,
    current_user: User,
    db: Session,
    removes_admin_access: bool,
) -> None:
    if target_user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Không thể tự thay đổi quyền quản trị của chính mình.",
        )

    if not removes_admin_access:
        return

    if (
        target_user.role == "admin"
        and target_user.status == "active"
    ):
        active_admin_count = db.scalar(
            select(func.count())
            .select_from(User)
            .where(
                User.role == "admin",
                User.status == "active",
            )
        )

        if active_admin_count is None or active_admin_count <= 1:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Không thể hạ quyền admin active cuối cùng.",
            )

@router.get("/users", response_model=list[AdminUserPublic])
def user_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_minimum_role("admin")),
) -> list[User]:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    
    return list(users)

@router.patch(
    "/users/{user_id}/role",
    response_model=AdminUserPublic,
)
def update_user_role(
    user_id: uuid.UUID,
    payload: UserRoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_minimum_role("admin")
    ),
) -> User:
    target_user = get_existed_user(user_id, db)

    removes_admin_access = (
        target_user.role == "admin"
        and target_user.status == "active"
        and payload.role != "admin"
    )

    ensure_admin_change_allowed(
        target_user=target_user,
        current_user=current_user,
        db=db,
        removes_admin_access=removes_admin_access,
    )

    old_role = target_user.role
    target_user.role = payload.role
    target_user.updated_at = datetime.now(timezone.utc)

    log_audit(
        db=db,
        admin_id=current_user.id,
        action="update_role",
        target_type="user",
        target_id=user_id,
        old_value=json.dumps({"role": old_role}),
        new_value=json.dumps({"role": payload.role}),
    )

    db.commit()
    db.refresh(target_user)

    return target_user

@router.patch(
    "/users/{user_id}/status",
    response_model=AdminUserPublic,
)
def update_user_status(
    user_id: uuid.UUID,
    payload: UserStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_minimum_role("admin")
    ),
) -> User:
    target_user = get_existed_user(user_id, db)

    removes_admin_access = (
        target_user.role == "admin"
        and target_user.status == "active"
        and payload.status != "active"
    )

    ensure_admin_change_allowed(
        target_user=target_user,
        current_user=current_user,
        db=db,
        removes_admin_access=removes_admin_access,
    )

    old_status = target_user.status
    target_user.status = payload.status
    target_user.updated_at = datetime.now(timezone.utc)

    log_audit(
        db=db,
        admin_id=current_user.id,
        action="update_status",
        target_type="user",
        target_id=user_id,
        old_value=json.dumps({"status": old_status}),
        new_value=json.dumps({"status": payload.status}),
    )

    db.commit()
    db.refresh(target_user)

    return target_user

@router.get("/audit-logs", response_model=list[AdminAuditLogPublic])
def get_audit_logs(
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_minimum_role("admin")),
) -> list[AdminAuditLog]:
    """Lấy danh sách audit logs"""
    logs = db.scalars(
        select(AdminAuditLog)
        .order_by(AdminAuditLog.created_at.desc())
        .limit(limit)
        .offset(offset)
    ).all()

    return list(logs)