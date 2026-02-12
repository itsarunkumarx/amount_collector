from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.case import CaseStatus

class CaseBase(BaseModel):
    borrower_email: str
    borrower_phone: str
    borrower_name: str
    amount_lent: float
    interest_rate: float = 0.0
    due_date: Optional[datetime] = None
    proof_documents: List[str] = []
    
    bank_name: Optional[str] = None
    account_number: Optional[str] = None
    ifsc_code: Optional[str] = None

class CaseCreate(CaseBase):
    assigned_worker_id: Optional[str] = None

class CaseUpdate(BaseModel):
    status: Optional[CaseStatus] = None
    admin_verification_notes: Optional[str] = None
    amount_pending: Optional[float] = None
    assigned_worker_id: Optional[str] = None
    due_date: Optional[datetime] = None

class CaseResponse(CaseBase):
    id: str
    lender_id: str
    assigned_worker_id: Optional[str] = None
    status: CaseStatus
    amount_pending: float
    due_date: Optional[datetime] = None
    admin_verification_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
