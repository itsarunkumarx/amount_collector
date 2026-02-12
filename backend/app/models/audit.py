from datetime import datetime
from typing import Optional, Dict, Any
from beanie import Document, Link
from pydantic import Field
from app.models.user import User

class AuditLog(Document):
    action: str
    details: Dict[str, Any] = {}
    
    performed_by: Optional[Link[User]] = None
    ip_address: Optional[str] = None
    
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "audit_logs"
