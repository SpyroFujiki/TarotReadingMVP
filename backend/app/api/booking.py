import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.dependencies import get_db

from app.models.user import User
from app.models.enum import BookingStatus
from app.models.booking import Booking
from app.models.reading_package import ReadingPackage

from app.schemas.booking import BookingCreate, BookingPublic

from app.api.dependencies import require_current_user, require_minimum_role

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post(
        "/",
        response_model=BookingPublic,
        status_code=status.HTTP_201_CREATED,
    )
def create_booking(
    payload: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_minimum_role("customer")),
) -> Booking:
    package = db.scalar(
        select(ReadingPackage).where(
            ReadingPackage.id == payload.package_id,
            ReadingPackage.is_active == True,
            )
        )
    if package is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Gói đọc không tồn tại hoặc đã ngừng hoạt động.",
        )

    topic = payload.topic.strip()
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Chủ đề không được để trống.",
        )

    booking = Booking(
        package_id=package.id,
        customer_id=current_user.id,
        reader_id=None,
        topic=topic,
        status=BookingStatus.PENDING,
        package_name_snapshot=package.name,
        price_snapshot=package.price,
        expected_response_minutes_snapshot=package.expected_response_minutes,
    )
    
    db.add(booking)
    db.commit()
    db.refresh(booking)

    return booking

@router.get(
    "/me",
    response_model=list[BookingPublic],
)
def list_my_bookings(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_minimum_role("customer")
    ),
) -> list[Booking]:
    bookings = db.scalars(
        select(Booking)
        .where(Booking.customer_id == current_user.id)
        .order_by(Booking.created_at.desc())
    ).unique().all()

    return list(bookings)

@router.get(
    "/{booking_id}",
    response_model=BookingPublic,
)
def get_my_booking(
    booking_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_minimum_role("customer")
    ),
) -> Booking:
    booking = db.scalar(
        select(Booking).where(
            Booking.id == booking_id,
            Booking.customer_id == current_user.id,
        )
    )

    if booking is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy booking.",
        )

    return booking