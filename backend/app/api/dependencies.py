from uuid import UUID

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.dependencies import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)

ROLE_LEVELS = {
    "admin": 3,
    "reader": 2,
    "customer": 1,
}

def require_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    unauthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token không hợp lệ hoặc đã hết hạn.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if credentials is None:
        raise unauthorized_exception

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        subject = payload.get("sub")

        if subject is None:
            raise unauthorized_exception

        user_id = UUID(subject)

    except (jwt.InvalidTokenError, ValueError):
        raise unauthorized_exception

    user = db.get(User, user_id)

    if user is None:
        raise unauthorized_exception

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản hiện không hoạt động.",
        )

    return user

def require_minimum_role(required_role: str):
    if required_role not in ROLE_LEVELS:
        raise ValueError(f"Role không hợp lệ: {required_role}")

    required_level = ROLE_LEVELS[required_role]

    def dependency(
        current_user: User = Depends(require_current_user),
    ) -> User:
        current_level = ROLE_LEVELS.get(
            current_user.role,
            0,
        )

        if current_level < required_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền thực hiện thao tác này.",
            )

        return current_user

    return dependency