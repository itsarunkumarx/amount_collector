from datetime import datetime
from typing import Optional
from enum import Enum
from beanie import Document, Link
from pydantic import Field
from app.models.user import User
from app.models.case import MoneyCase

class TransactionType(str, Enum):
    PAYMENT = "PAYMENT" # Borrower paying back
    DISBURSEMENT = "DISBURSEMENT" # Lender giving money (initial)

class Transaction(Document):
    case: Link[MoneyCase]
    performed_by: Link[User]
    
    amount: float
    transaction_type: TransactionType
    
    payment_mode: str = "CASH"
    notes: Optional[str] = None
    
    proof_url: Optional[str] = None # Screenshot of payment
    is_verified_by_admin: bool = False
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "transactions"
