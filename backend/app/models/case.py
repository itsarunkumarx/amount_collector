from datetime import datetime
from typing import List, Optional
from enum import Enum
from beanie import Document, Link, PydanticObjectId
from pydantic import Field
from app.models.user import User

class CaseStatus(str, Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    ACTIVE = "ACTIVE" # Verified and alerts running
    COMPLETED = "COMPLETED" # Fully paid
    REJECTED = "REJECTED"
    DISPUTED = "DISPUTED"

class MoneyCase(Document):
    lender: Link[User]
    # Borrower info (can be a registered user or just contact details)
    borrower_email: str 
    borrower_phone: str
    borrower_name: str
    borrower_id: Optional[Link[User]] = None # If they register

    assigned_worker: Optional[Link[User]] = None
    assigned_worker: Optional[Link[User]] = None
    due_date: Optional[datetime] = None
    
    # Bank Details
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

    amount_lent: float
    amount_pending: float
    interest_rate: float = 0.0
    
    proof_documents: List[str] = [] # URLs to uploaded files
    
    status: CaseStatus = CaseStatus.PENDING_VERIFICATION
    admin_verification_notes: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "cases"
