# Tính năng: Tin nhắn dịch vụ

import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_current_user
from app.db.dependencies import get_db
from app.models.booking import Booking
from app.models.enum import BookingStatus
from app.models.service_message import ServiceMessage
from app.models.user import User
from app.schemas.service_message import (
    ServiceMessageCreate,
    ServiceMessagePublic,
)

router = APIRouter(prefix="/bookings",tags=["service-messages"],)

# Kiểm tra xem đơn hàng có tồn tại hay không
def get_existed_booking(
    booking_id: uuid.UUID,
    db: Session,
) -> Booking:
    booking = db.get(Booking, booking_id)

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đơn hàng.",
        )

    return booking

# Kiểm tra quyền đọc tin nhắn
def require_message_read_access(
    booking: Booking,
    current_user: User,
) -> None:
    is_customer = booking.customer_id == current_user.id
    is_reader = booking.reader_id == current_user.id
    is_dispute_admin = (
        current_user.role == "admin"
        and booking.status == BookingStatus.DISPUTING
    )

    if not (is_customer or is_reader or is_dispute_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền đọc tin nhắn của đơn này.",
        )
        
# Kiểm tra quyền gửi tin nhắn
def require_message_send_access(
    booking: Booking,
    current_user: User,
) -> None:
    is_customer = booking.customer_id == current_user.id
    is_reader = booking.reader_id == current_user.id
    
    if not (is_customer or is_reader):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này.",
        )

    if booking.status != BookingStatus.IN_PROGRESS:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Đơn hàng hiện không cho phép gửi tin nhắn.",
        )
        
@router.post("/{booking_id}/messages",
    response_model=ServiceMessagePublic,
    status_code=status.HTTP_201_CREATED,
    summary="Gửi tin nhắn trong cuộc trò chuyện dịch vụ (chỉ người liên quan mới có quyền gửi)"
)
def create_service_message(
    booking_id: uuid.UUID,
    payload: ServiceMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
) -> ServiceMessage:
    
    booking = get_existed_booking(booking_id, db)

    require_message_send_access(booking,current_user)

    content = payload.content.strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nội dung tin nhắn không được để trống.",
        )

    message = ServiceMessage(
        booking_id=booking.id,
        sender_id=current_user.id,
        content=content,
        file_url=None,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message

@router.get(
    "/{booking_id}/messages",
    response_model=list[ServiceMessagePublic],
    summary="Lấy danh sách tin nhắn trong cuộc trò chuyện dịch vụ"
)
def list_service_messages(
    booking_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
) -> list[ServiceMessage]:
    booking = get_existed_booking(booking_id, db)

    require_message_read_access(booking,current_user)

    messages = db.scalars(
        select(ServiceMessage)
        .where(ServiceMessage.booking_id == booking.id)
        .order_by(
            ServiceMessage.created_at.asc(),
            ServiceMessage.id.asc(),
        )
    ).unique().all()

    return list(messages)