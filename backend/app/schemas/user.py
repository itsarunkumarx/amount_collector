from typing import Optional
from pydantic import BaseModel, EmailStr
from app.models.user import UserRole
from pydantic import Field

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone_number: Optional[str] = None
    role: UserRole = UserRole.VERIFIED_USER
    is_active: bool = True
    profile_picture_url: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    password: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    profile_picture_url: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None

class UserInDBBase(UserBase):
    id: str # PydanticObjectId converted to string
    is_verified: bool
    trust_score: float
    
    class Config:
        from_attributes = True

class UserResponse(UserInDBBase):
    pass
