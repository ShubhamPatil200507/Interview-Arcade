"""
Interview Arcade — Authentication Pydantic Schemas
Strict request and response validation with email format checks.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UserRegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=r"^[a-zA-Z0-9_-]+$")
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    target_role: Optional[str] = Field(default="backend", max_length=50)

    model_config = ConfigDict(extra="forbid")


class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)

    model_config = ConfigDict(extra="forbid")


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    target_role: str
    xp: int
    level: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
