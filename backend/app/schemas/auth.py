from typing import Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=2, max_length=150)
    language: str = "fr"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class OtpSendRequest(BaseModel):
    phone: str = Field(min_length=8, max_length=20)


class OtpVerifyRequest(BaseModel):
    phone: str
    code: str = Field(min_length=6, max_length=6)
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    id: UUID
    email: Optional[str]
    phone: Optional[str]
    full_name: str
    avatar_url: Optional[str]
    role: str
    language: str

    model_config = {"from_attributes": True}
