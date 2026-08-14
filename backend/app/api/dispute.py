# Tính năng: Khiếu nại

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.dependencies import require_current_user

from app.db.dependencies import get_db

from app.models.booking import Booking
from app.models.dispute import Dispute
from app.models.enum import BookingStatus, DisputeStatus
from app.models.user import User

from app.schemas.dispute import DisputeCreate, DisputePublic

router = APIRouter(tags=["disputes"])

@router.post(
    "/bookings/{booking_id}/dispute",
    response_model=DisputePublic,
    status_code=status.HTTP_201_CREATED,
    summary="Tạo khiếu nại cho đơn hàng (chỉ người liên quan mới có quyền khiếu nại)"
)
def create_dispute(
    booking_id: uuid.UUID,
    payload: DisputeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
) -> Dispute:
    booking = db.get(Booking, booking_id)

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn hàng.",
        )

    is_customer = (
        current_user.role == "customer"
        and booking.customer_id == current_user.id
    )

    is_reader = (
        current_user.role == "reader"
        and booking.reader_id == current_user.id
    )

    if not (is_customer or is_reader):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn hàng.",
        )

    allowed_statuses = {
        BookingStatus.ASSIGNED,
        BookingStatus.IN_PROGRESS,
        BookingStatus.COMPLETED,
    }

    if booking.status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Chỉ có thể khiếu nại đơn đã được nhận, "
                "đang xử lý hoặc đã hoàn thành."
            ),
        )

    dispute = Dispute(
        booking_id=booking.id,
        raised_by_id=current_user.id,
        admin_id=None,
        reason_category=payload.reason_category.value,
        description=payload.description.strip(),
        status=DisputeStatus.OPEN,
    )

    booking.status = BookingStatus.DISPUTING
    booking.updated_at = datetime.now(timezone.utc)

    db.add(dispute)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Đơn hàng này đã có khiếu nại.",
        ) from None

    db.refresh(dispute)

    return dispute

@router.get(
    "/disputes/me",
    response_model=list[DisputePublic],
    summary="Lấy danh sách khiếu nại của người dùng hiện tại"
)
def list_my_disputes(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
) -> list[Dispute]:
    disputes = db.scalars(
        select(Dispute)
        .where(Dispute.raised_by_id == current_user.id)
        .order_by(Dispute.created_at.desc())
    ).all()

    return list(disputes)

@router.get(
    "/disputes/{dispute_id}",
    response_model=DisputePublic,
    summary="Lấy thông tin chi tiết của một khiếu nại (chỉ người liên quan mới có quyền xem)"
)
def get_dispute_detail(
    dispute_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
) -> Dispute:
    dispute = db.get(Dispute, dispute_id)

    if dispute is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khiếu nại.",
        )

    booking = dispute.booking

    is_customer = booking.customer_id == current_user.id
    is_reader = booking.reader_id == current_user.id
    is_assigned_admin = (
        current_user.role == "admin"
        and dispute.admin_id == current_user.id
    )

    if not (is_customer or is_reader or is_assigned_admin):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khiếu nại.",
        )

    return dispute