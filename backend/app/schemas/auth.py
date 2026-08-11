import re

from pydantic import BaseModel, EmailStr, field_validator, model_validator


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    confirm_password: str
    full_name: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Mật khẩu phải có ít nhất 8 ký tự")
        if not re.search(r"[A-Z]", value):
            raise ValueError("Mật khẩu phải có ít nhất 1 chữ hoa")
        if not re.search(r"[a-z]", value):
            raise ValueError("Mật khẩu phải có ít nhất 1 chữ thường")
        if not re.search(r"\d", value):
            raise ValueError("Mật khẩu phải có ít nhất 1 số")
        if not re.search(r"[^A-Za-z0-9]", value):
            raise ValueError("Mật khẩu phải có ít nhất 1 ký tự đặc biệt")
        return value

    @model_validator(mode="after")
    def validate_confirm_password(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Mật khẩu xác nhận không khớp")
        return self


class UserPublic(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    status: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
