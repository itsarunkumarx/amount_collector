from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.transaction import TransactionType

class TransactionBase(BaseModel):
    case_id: str
    amount: float
    transaction_type: TransactionType
    payment_mode: str = "CASH"
    notes: Optional[str] = None
    proof_url: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: str
    performed_by_id: str
    performed_by_name: str
    payment_mode: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
