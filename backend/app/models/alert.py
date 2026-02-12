from datetime import datetime
from enum import Enum
from typing import Optional
from beanie import Document, Link
from pydantic import Field
from app.models.case import MoneyCase
from app.models.user import User

class AlertSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class AlertStatus(str, Enum):
    PENDING = "PENDING"
    SENT = "SENT"
    FAILED = "FAILED"
    READ = "READ"

class Alert(Document):
    target_user_email: str # Could be unregistered borrower
    target_user_id: Optional[Link[User]] = None
    
    related_case: Optional[Link[MoneyCase]] = None
    
    title: str
    message: str
    severity: AlertSeverity = AlertSeverity.INFO
    status: AlertStatus = AlertStatus.PENDING
    
    scheduled_for: datetime = Field(default_factory=datetime.utcnow)
    sent_at: Optional[datetime] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "alerts"
