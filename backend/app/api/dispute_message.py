import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import require_current_user
from app.db.dependencies import get_db
from app.models.dispute import Dispute
from app.models.dispute_message import DisputeMessage
from app.models.enum import (
    DisputeMessageType,
    DisputeStatus,
)
from app.models.user import User
from app.schemas.dispute_message import (
    DisputeMessageCreate,
    DisputeMessagePublic,
)

router = APIRouter(
    prefix="/disputes",
    tags=["dispute-messages"],
)


def get_existed_dispute(
    dispute_id: uuid.UUID,
    db: Session,
) -> Dispute:
    dispute = db.get(Dispute, dispute_id)

    if dispute is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khiếu nại.",
        )

    return dispute


def require_dispute_read_access(
    dispute: Dispute,
    current_user: User,
) -> None:
    booking = dispute.booking

    is_customer = booking.customer_id == current_user.id
    is_reader = booking.reader_id == current_user.id
    is_assigned_admin = (
        current_user.role == "admin"
        and dispute.admin_id == current_user.id
    )

    if not (is_customer or is_reader or is_assigned_admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền truy cập khiếu nại này.",
        )


def require_dispute_send_access(
    dispute: Dispute,
    current_user: User,
) -> None:
    require_dispute_read_access(
        dispute=dispute,
        current_user=current_user,
    )

    if dispute.status not in {
        DisputeStatus.OPEN,
        DisputeStatus.REVIEWING,
    }:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Khiếu nại đã đóng, không thể gửi thêm tin nhắn.",
        )


@router.post(
    "/{dispute_id}/messages",
    response_model=DisputeMessagePublic,
    status_code=status.HTTP_201_CREATED,
)
def create_dispute_message(
    dispute_id: uuid.UUID,
    payload: DisputeMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
) -> DisputeMessage:
    dispute = get_existed_dispute(
        dispute_id=dispute_id,
        db=db,
    )

    require_dispute_send_access(
        dispute=dispute,
        current_user=current_user,
    )

    content = payload.content.strip()

    if not content:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Nội dung tin nhắn không được để trống.",
        )

    message = DisputeMessage(
        dispute_id=dispute.id,
        sender_id=current_user.id,
        type=DisputeMessageType(payload.type),
        content=content,
        file_url=None,
    )

    db.add(message)
    db.commit()
    db.refresh(message)

    return message


@router.get(
    "/{dispute_id}/messages",
    response_model=list[DisputeMessagePublic],
)
def list_dispute_messages(
    dispute_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_current_user),
) -> list[DisputeMessage]:
    dispute = get_existed_dispute(
        dispute_id=dispute_id,
        db=db,
    )

    require_dispute_read_access(
        dispute=dispute,
        current_user=current_user,
    )

    messages = db.scalars(
        select(DisputeMessage)
        .where(
            DisputeMessage.dispute_id == dispute.id
        )
        .order_by(
            DisputeMessage.created_at.asc(),
            DisputeMessage.id.asc(),
        )
    ).unique().all()

    return list(messages)