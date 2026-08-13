import pytest
import uuid
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.session import SessionLocal
from app.models.user import User
from app.models.booking import Booking
from app.models.dispute import Dispute
from app.models.reading_package import ReadingPackage
from app.models.enum import (
    UserRoles,
    BookingStatus,
    DisputeStatus,
    DisputeVerdict,
    DisputeReasonCategory,
)

client = TestClient(app)


@pytest.fixture
def db():
    db = SessionLocal()
    yield db
    db.close()


@pytest.fixture
def admin_user(db: Session):
    admin = User(
        email="admin@test.com",
        password_hash="hashed_password",
        full_name="Admin User",
        role=UserRoles.ADMIN.value,
        status="active",
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def customer_user(db: Session):
    customer = User(
        email="customer@test.com",
        password_hash="hashed_password",
        full_name="Customer User",
        role=UserRoles.CUSTOMER.value,
        status="active",
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return customer


@pytest.fixture
def reader_user(db: Session):
    reader = User(
        email="reader@test.com",
        password_hash="hashed_password",
        full_name="Reader User",
        role=UserRoles.READER.value,
        status="active",
    )
    db.add(reader)
    db.commit()
    db.refresh(reader)
    return reader


@pytest.fixture
def reading_package(db: Session):
    package = ReadingPackage(
        name="Test Package",
        description="Test Description",
        price=10000,
        expected_response_minutes=30,
        is_active=True,
    )
    db.add(package)
    db.commit()
    db.refresh(package)
    return package


@pytest.fixture
def booking(db: Session, customer_user: User, reader_user: User, reading_package: ReadingPackage):
    booking = Booking(
        package_id=reading_package.id,
        customer_id=customer_user.id,
        reader_id=reader_user.id,
        topic="Test Topic",
        status=BookingStatus.COMPLETED,
        package_name_snapshot=reading_package.name,
        price_snapshot=reading_package.price,
        expected_response_minutes_snapshot=reading_package.expected_response_minutes,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@pytest.fixture
def dispute(db: Session, booking: Booking, customer_user: User):
    dispute = Dispute(
        booking_id=booking.id,
        raised_by_id=customer_user.id,
        reason_category=DisputeReasonCategory.POOR_QUALITY.value,
        description="The service quality was poor.",
        status=DisputeStatus.OPEN,
    )
    db.add(dispute)
    db.commit()
    db.refresh(dispute)
    return dispute


def test_resolve_dispute_with_refund_full(
    db: Session,
    admin_user: User,
    dispute: Dispute,
):
    """Test resolving dispute with full refund verdict"""
    response = client.post(
        f"/admin/disputes/{dispute.id}/resolve",
        json={
            "verdict": DisputeVerdict.REFUND_FULL.value,
            "refund_amount": 10000,
            "resolution_note": "Customer refund approved",
        },
        headers={
            "Authorization": f"Bearer {admin_user.id}"
        }
    )

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == DisputeStatus.RESOLVED.value
    assert data["verdict"] == DisputeVerdict.REFUND_FULL.value
    assert data["refund_amount"] == 10000
    assert data["resolution_note"] == "Customer refund approved"
    assert data["resolved_at"] is not None

    # Check booking status updated
    db.refresh(dispute)
    assert dispute.booking.status == BookingStatus.REFUNDED.value


def test_resolve_dispute_with_rejected_verdict(
    db: Session,
    admin_user: User,
    dispute: Dispute,
):
    """Test resolving dispute with rejected verdict"""
    response = client.post(
        f"/admin/disputes/{dispute.id}/resolve",
        json={
            "verdict": DisputeVerdict.REJECTED.value,
            "resolution_note": "Dispute claim not valid",
        },
        headers={
            "Authorization": f"Bearer {admin_user.id}"
        }
    )

    assert response.status_code == 200
    data = response.json()

    assert data["status"] == DisputeStatus.RESOLVED.value
    assert data["verdict"] == DisputeVerdict.REJECTED.value
    assert data["resolution_note"] == "Dispute claim not valid"
    assert data["resolved_at"] is not None

    # Check booking status updated to COMPLETED
    db.refresh(dispute)
    assert dispute.booking.status == BookingStatus.COMPLETED.value


def test_resolve_dispute_already_resolved(
    db: Session,
    admin_user: User,
    dispute: Dispute,
):
    """Test cannot resolve already resolved dispute"""
    # First resolve
    dispute.status = DisputeStatus.RESOLVED
    dispute.verdict = DisputeVerdict.REJECTED
    db.add(dispute)
    db.commit()

    # Try to resolve again
    response = client.post(
        f"/admin/disputes/{dispute.id}/resolve",
        json={
            "verdict": DisputeVerdict.REJECTED.value,
            "resolution_note": "This should fail",
        },
        headers={
            "Authorization": f"Bearer {admin_user.id}"
        }
    )

    assert response.status_code == 409


def test_resolve_nonexistent_dispute(
    db: Session,
    admin_user: User,
):
    """Test resolving nonexistent dispute"""
    fake_id = uuid.uuid4()

    response = client.post(
        f"/admin/disputes/{fake_id}/resolve",
        json={
            "verdict": DisputeVerdict.REJECTED.value,
            "resolution_note": "Test resolution",
        },
        headers={
            "Authorization": f"Bearer {admin_user.id}"
        }
    )

    assert response.status_code == 404
