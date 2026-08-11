from datetime import datetime, timedelta, timezone
from uuid import UUID

import jwt
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.db.dependencies import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserPublic

router = APIRouter(prefix="/auth", tags=["auth"])


def _create_access_token(subject: str) -> str:
    expires_at = datetime.now(tz=timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {
        "sub": subject,
        "exp": expires_at,
        "iat": datetime.now(tz=timezone.utc),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == str(payload.email).lower()))

    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email hoặc mật khẩu không đúng.",
        )

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản hiện không hoạt động.",
        )

    token = _create_access_token(str(user.id))
    return TokenResponse(
        access_token=token,
        user=UserPublic(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            status=user.status,
        ),
    )


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    normalized_email = str(payload.email).lower()
    existing_user = db.scalar(select(User).where(User.email == normalized_email))

    if existing_user is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email đã được sử dụng.",
        )

    user = User(
        email=normalized_email,
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        role="customer",
        status="active",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = _create_access_token(str(user.id))
    return TokenResponse(
        access_token=token,
        user=UserPublic(
            id=str(user.id),
            email=user.email,
            full_name=user.full_name,
            role=user.role,
            status=user.status,
        ),
    )
