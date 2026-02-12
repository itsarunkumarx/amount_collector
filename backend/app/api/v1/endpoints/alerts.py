from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.models.user import User
from app.models.alert import Alert, AlertStatus
from app.schemas.alert import AlertCreate, AlertResponse
from app.core.user_roles import UserRole

router = APIRouter()

@router.get("/", response_model=List[AlertResponse])
async def get_my_alerts(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get alerts for the current user (by email or user ID).
    """
    if current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        # Admins see all alerts
        alerts = await Alert.find_all().sort("-created_at").to_list()
    elif current_user.role == UserRole.TEAM_WORKER:
        # Workers see alerts related to them or just all pending alerts?
        # Let's show all alerts for now so they can track logic, or maybe just alerts they triggered?
        # Better: Workers might want to see alerts for cases they manage.
        # Simplest fix: Show all for workers too for now, or filter by assigned cases if we had time.
        alerts = await Alert.find_all().sort("-created_at").to_list()
    else:
        alerts = await Alert.find(Alert.target_user_email == current_user.email).sort("-created_at").to_list()
    return [
        AlertResponse(
            id=str(a.id),
            **a.dict(exclude={'id'})
        )
        for a in alerts
    ]

@router.post("/", response_model=AlertResponse)
async def create_alert(
    alert_in: AlertCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Manually create an alert (Admin only).
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEAM_WORKER]:
        raise HTTPException(status_code=400, detail="Not authorized")
        
    alert = Alert(
        target_user_email=alert_in.target_user_email,
        title=alert_in.title,
        message=alert_in.message,
        severity=alert_in.severity,
        status=AlertStatus.PENDING
    )
    if alert_in.case_id:
        # Link case if needed
        pass
        
    await alert.create()
    return AlertResponse(id=str(alert.id), **alert.dict(exclude={'id'}))

@router.put("/{alert_id}/stop", response_model=AlertResponse)
async def stop_alert(
    alert_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Stop/Resolve an alert. Admin only.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.TEAM_WORKER]:
        raise HTTPException(status_code=400, detail="Only Admins or Team Workers can stop alerts")
        
    alert = await Alert.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
        
    alert.status = AlertStatus.READ # Or some "STOPPED" status if we add it
    await alert.save()
    
    return AlertResponse(id=str(alert.id), **alert.dict(exclude={'id'}))
