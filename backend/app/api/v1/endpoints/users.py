from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.models.user import User
from app.models.case import MoneyCase, CaseStatus
from app.models.transaction import Transaction, TransactionType
from app.schemas.user import UserResponse, UserUpdate
from app.core.user_roles import UserRole
from datetime import datetime

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        trust_score=current_user.trust_score,
        address=current_user.address,
        bio=current_user.bio
    )

@router.get("/me/stats", response_model=dict)
async def get_user_stats(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get dashboard stats for the current user.
    - collected_today: Sum of payments collected today.
    - pending_tasks: Number of active cases assigned.
    """
    # 1. Collected Today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    # Check if user is worker
    if current_user.role == UserRole.TEAM_WORKER:
        # Find transactions by this worker today
        txs = await Transaction.find(
            Transaction.performed_by.id == current_user.id,
            Transaction.transaction_type == TransactionType.PAYMENT,
            Transaction.created_at >= today_start
        ).to_list()
        
        collected_today = sum(t.amount for t in txs)
        
        # 2. Pending Tasks (Active Cases)
        # Using simple count for now.
        pending_count = await MoneyCase.find(
            MoneyCase.assigned_worker.id == current_user.id,
            MoneyCase.status == CaseStatus.ACTIVE
        ).count()
        
        return {
            "label_1": "Collected Today",
            "value_1": collected_today,
            "type_1": "currency",
            "label_2": "Pending Tasks",
            "value_2": pending_count,
            "type_2": "number"
        }

    elif current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
         txs = await Transaction.find(
            Transaction.transaction_type == TransactionType.PAYMENT,
            Transaction.created_at >= today_start
        ).to_list()
         collected_today = sum(t.amount for t in txs)
         pending_count = await MoneyCase.find(MoneyCase.status == CaseStatus.ACTIVE).count()
         
         return {
            "label_1": "System Collected Today",
            "value_1": collected_today,
            "type_1": "currency",
            "label_2": "Total Active Cases",
            "value_2": pending_count,
            "type_2": "number"
        }
         
    else:
        # Lender / User logic
        # 1. Total Amount Lent
        # 2. Active Cases
        
        # Link comparison is safer - using raw DBRef query
        from bson import ObjectId
        lid = ObjectId(str(current_user.id))
        
        my_cases = await MoneyCase.find({"lender.$id": lid}).to_list()
        
        total_lent = sum(c.amount_lent for c in my_cases)
        active_count = sum(1 for c in my_cases if c.status == CaseStatus.ACTIVE)
        
        return {
            "label_1": "Total Amount Lent",
            "value_1": total_lent,
            "type_1": "currency",
            "label_2": "Active Cases",
            "value_2": active_count,
            "type_2": "number"
        }

@router.put("/me", response_model=UserResponse)
async def update_user_me(
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    if user_in.email and user_in.email != current_user.email:
        existing_user = await User.find_one(User.email == user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system",
            )
            
    # Update fields
    if user_in.full_name: current_user.full_name = user_in.full_name
    if user_in.email: current_user.email = user_in.email
    if user_in.phone_number: current_user.phone_number = user_in.phone_number
    if user_in.address: current_user.address = user_in.address
    if user_in.bio: current_user.bio = user_in.bio
    # Password update would need hashing logic here
    
    await current_user.save()
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        phone_number=current_user.phone_number,
        role=current_user.role,
        is_active=current_user.is_active,
        is_verified=current_user.is_verified,
        trust_score=current_user.trust_score,
        address=current_user.address,
        bio=current_user.bio
    )

@router.get("/workers", response_model=List[UserResponse])
async def read_workers(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get all team workers.
    """
    workers = await User.find(User.role == "TEAM_WORKER").to_list()
    return [
        UserResponse(
            id=str(w.id),
            email=w.email,
            full_name=w.full_name,
            phone_number=w.phone_number,
            role=w.role,
            is_active=w.is_active,
            is_verified=w.is_verified,
            trust_score=w.trust_score
        )
        for w in workers
    ]

@router.get("/", response_model=List[UserResponse])
async def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Retrieve users. Admin only.
    """
    users = await User.find_all().skip(skip).limit(limit).to_list()
    return [
        UserResponse(
            id=str(u.id),
            email=u.email,
            full_name=u.full_name,
            phone_number=u.phone_number,
            role=u.role,
            is_active=u.is_active,
            is_verified=u.is_verified,
            trust_score=u.trust_score
        )
        for u in users
    ]

@router.put("/{user_id}/verify", response_model=UserResponse)
async def verify_user(
    user_id: str,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Verify a user. Admin only.
    """
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_verified = True
    user.role = "VERIFIED_USER" # Upgrade role if needed
    await user.save()
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        trust_score=user.trust_score
    )

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Delete a user. Admin Only.
    """
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(status_code=400, detail="Cannot delete Super Admin")
        
    await user.delete()
    return None

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_in: UserUpdate,
    current_user: User = Depends(deps.get_current_active_superuser),
) -> Any:
    """
    Update a user. Admin Only.
    """
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_in.email and user_in.email != user.email:
        existing_user = await User.find_one(User.email == user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system",
            )
            
    if user_in.full_name: user.full_name = user_in.full_name
    if user_in.email: user.email = user_in.email
    if user_in.phone_number: user.phone_number = user_in.phone_number
    if user_in.role: user.role = user_in.role
    if user_in.is_active is not None: user.is_active = user_in.is_active
    
    # Password update logic if needed, but usually separate endpoint or handled here with hashing
    if user_in.password:
        from app.core.security import get_password_hash
        user.hashed_password = get_password_hash(user_in.password)

    await user.save()
    
    return UserResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        phone_number=user.phone_number,
        role=user.role,
        is_active=user.is_active,
        is_verified=user.is_verified,
        trust_score=user.trust_score
    )
