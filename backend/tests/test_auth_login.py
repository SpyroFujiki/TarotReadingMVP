from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import select

from app.core.security import hash_password
from app.db.session import SessionLocal
from app.main import app
from app.models.user import User


client = TestClient(app)


def test_login_returns_token_for_valid_credentials():
    email = f"login-{uuid4()}@example.com"

    with SessionLocal() as session:
        session.add(
            User(
                email=email,
                password_hash=hash_password("Secret123!"),
                full_name="Login Test User",
                role="customer",
                status="active",
            )
        )
        session.commit()

    response = client.post(
        "/auth/login",
        json={"email": email, "password": "Secret123!"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]
    assert body["user"]["email"] == email


def test_login_rejects_invalid_password():
    response = client.post(
        "/auth/login",
        json={"email": "customer1@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401


def test_register_creates_user_and_returns_token():
    response = client.post(
        "/auth/register",
        json={
            "email": f"newuser-{uuid4()}@example.com",
            "password": "Abc123!@",
            "confirm_password": "Abc123!@",
            "full_name": "New User",
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["access_token"]


def test_register_rejects_weak_password():
    response = client.post(
        "/auth/register",
        json={
            "email": "weak@example.com",
            "password": "12345678",
            "confirm_password": "12345678",
            "full_name": "Weak Password",
        },
    )

    assert response.status_code == 422
