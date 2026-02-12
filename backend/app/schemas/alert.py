from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from app.models.alert import AlertSeverity, AlertStatus

class AlertBase(BaseModel):
    title: str
    message: str
    severity: AlertSeverity = AlertSeverity.INFO
    target_user_email: str
    
class AlertCreate(AlertBase):
    case_id: Optional[str] = None

class AlertResponse(AlertBase):
    id: str
    status: AlertStatus
    sent_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True
