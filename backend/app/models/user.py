from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document, Indexed
from pydantic import Field, EmailStr

from app.core.user_roles import UserRole

class User(Document):
    email: Indexed(EmailStr, unique=True)
    hashed_password: str
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.USER
    is_active: bool = True
    is_verified: bool = False
    trust_score: float = 100.0
    profile_picture_url: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "users"
