import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.api.dependencies import require_minimum_role
from app.db.dependencies import get_db
from app.models.booking import Booking
from app.models.dispute import Dispute
from app.models.enum import DisputeStatus, DisputeVerdict, BookingStatus
from app.models.user import User
from app.schemas.dispute import DisputePublic, DisputeResolve

router = APIRouter(prefix="/admin",tags=["admin"])

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
    now = datetime.now(timezone.utc)

    dispute = db.get(Dispute, dispute_id)

    if dispute is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy khiếu nại.",
        )

    if dispute.status not in {DisputeStatus.OPEN, DisputeStatus.REVIEWING}:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Khiếu nại không ở trạng thái mở hoặc đang xem xét.",
        )

    if dispute.status == DisputeStatus.OPEN:
        if dispute.admin_id is None:
            dispute.admin_id = current_user.id

    # Update dispute
    dispute.status = DisputeStatus.RESOLVED
    dispute.verdict = payload.verdict
    dispute.refund_amount = payload.refund_amount
    dispute.resolution_note = payload.resolution_note
    dispute.resolved_at = now

    # Update booking status based on verdict
    booking = dispute.booking

    if payload.verdict == DisputeVerdict.REJECTED:
        booking.status = BookingStatus.COMPLETED
        booking.completed_at = now
    elif payload.verdict in {DisputeVerdict.REFUND_FULL, DisputeVerdict.REFUND_PARTIAL}:
        booking.status = BookingStatus.REFUNDED

    booking.updated_at = now

    db.add(dispute)
    db.add(booking)
    db.commit()
    db.refresh(dispute)

    return dispute