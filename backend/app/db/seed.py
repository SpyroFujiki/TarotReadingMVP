from sqlalchemy import select

from app.core.config import settings
from app.core.security import hash_password
from app.db.session import SessionLocal
from app.models.reading_package import ReadingPackage
from app.models.user import User

PACKAGES = [
    {
        "name": "The Star",
        "description": "Giải đáp ngắn gọn một câu hỏi cụ thể",
        "price": 79000,
        "expected_response_minutes": 20,
    },
    {
        "name": "The Moon",
        "description": "Phân tích chi tiết 01 vấn đề cụ thể",
        "price": 149000,
        "expected_response_minutes": 60,
    },
    {
        "name": "The Sun",
        "description": "Trải bài chuyên sâu với phần giải thích mở rộng về 01 lĩnh vực.",
        "price": 299000,
        "expected_response_minutes": 120,
    },
]


TEST_USERS = [
    {
        "email": "customer1@example.com",
        "full_name": "Test Customer 1",
        "role": "customer",
    },
    {
        "email": "customer2@example.com",
        "full_name": "Test Customer 2",
        "role": "customer",
    },
    {
        "email": "reader1@example.com",
        "full_name": "Test Reader 1",
        "role": "reader",
    },
    {
        "email": "reader2@example.com",
        "full_name": "Test Reader 2",
        "role": "reader",
    },
    {
        "email": "admin@example.com",
        "full_name": "Test Admin",
        "role": "admin",
    },
]


def seed_reading_packages(session) -> None:
    for package_data in PACKAGES:
        existing_package = session.scalar(
            select(ReadingPackage).where(
                ReadingPackage.name == package_data["name"]
            )
        )

        if existing_package is None:
            session.add(
                ReadingPackage(**package_data)
            )


def seed_test_users(session) -> None:
    if not settings.seed_user_password:
        print(
            "Skipped test users: "
            "SEED_USER_PASSWORD is not configured."
        )
        return

    for user_data in TEST_USERS:
        existing_user = session.scalar(
            select(User).where(
                User.email == user_data["email"]
            )
        )

        if existing_user is not None:
            continue

        session.add(
            User(
                email=user_data["email"],
                full_name=user_data["full_name"],
                role=user_data["role"],
                status="active",
                password_hash=hash_password(
                    settings.seed_user_password
                ),
            )
        )


def run_seed() -> None:
    with SessionLocal() as session:
        seed_reading_packages(session)
        seed_test_users(session)
        session.commit()

    print("Database seed completed.")


if __name__ == "__main__":
    run_seed()