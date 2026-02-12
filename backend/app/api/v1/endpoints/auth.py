from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()

@router.post("/login", response_model=Token)
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = await User.find_one(User.email == form_data.username)
    if not user:
        # Check against fake hashed password to prevent timing attacks? 
        # For simplicity, we just fail.
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    if not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
        
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            subject=str(user.id), expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user_id": str(user.id),
        "role": user.role,
        "full_name": user.full_name,
    }

@router.post("/register", response_model=UserResponse)
async def register_user(
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    user = await User.find_one(User.email == user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system",
        )
    
    hashed_password = security.get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        role=user_in.role,
        is_active=user_in.is_active,
        phone_number=user_in.phone_number
    )
    await new_user.create()
    
    # Manually map to response schema if needed, but Pydantic should handle it 
    # if we passed a dict or object matching the schema. 
    # Beanie objects are Pydantic models too, so it maps well.
    # Note: responding with new_user directly might expose hashed_password if we aren't careful with the response_model.
    # UserResponse excludes hashed_password as it inherits from UserInDBBase which inherits UserBase.
    
    return UserResponse(
        id=str(new_user.id),
        email=new_user.email,
        full_name=new_user.full_name,
        phone_number=new_user.phone_number,
        role=new_user.role,
        is_active=new_user.is_active,
        is_verified=new_user.is_verified,
        trust_score=new_user.trust_score
    )
