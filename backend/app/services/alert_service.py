from datetime import datetime, timedelta
from typing import List
from app.models.alert import Alert, AlertSeverity, AlertStatus
from app.models.case import MoneyCase, CaseStatus
from app.models.user import User

class AlertService:
    async def create_alert(
        self,
        target_email: str,
        title: str,
        message: str,
        severity: AlertSeverity = AlertSeverity.INFO,
        case_id: str = None,
        target_phone: str = None
    ) -> Alert:
        alert = Alert(
            target_user_email=target_email,
            title=title,
            message=message,
            severity=severity,
            status=AlertStatus.PENDING
        )
        # Link case/user if possible
        if case_id:
            case = await MoneyCase.get(case_id)
            if case:
                alert.related_case = case
                
        user = await User.find_one(User.email == target_email)
        if user:
            alert.target_user_id = user
            
        await alert.create()

        # Mock SMS Sending
        if target_phone:
            print(f"\n{'='*50}\n[\033[96mSMS MOCK\033[0m] >>> Sending SMS to {target_phone}\nMessage: [{title}] {message}\n{'='*50}\n")
            # Here we would call Twilio/SNS
            # if settings.SMS_PROVIDER == "TWILIO":
            #     send_twilio_sms(target_phone, message)
            alert.status = AlertStatus.SENT
            alert.sent_at = datetime.utcnow()
            await alert.save()

        return alert

    async def process_due_alerts(self):
        """
        Check for cases that need alerts.
        This would be called by a scheduler.
        """
        # Find active cases
        active_cases = await MoneyCase.find(MoneyCase.status == CaseStatus.ACTIVE).to_list()
        
        for case in active_cases:
            # Logic: If amount pending > 0, check last alert time.
            # Simplified: Just create a reminder alert if none sent in last 24h.
            
            # This is a placeholder for complex logic
            await self.create_alert(
                target_email=case.borrower_email,
                title="Payment Reminder",
                message=f"You have pending dues of {case.amount_pending} for Case #{case.id}",
                severity=AlertSeverity.WARNING,
                case_id=str(case.id)
            )
            
    async def send_pending_alerts(self):
        """
        Simulate sending emails/SMS for PENDING alerts.
        """
        pending_alerts = await Alert.find(Alert.status == AlertStatus.PENDING).to_list()
        for alert in pending_alerts:
            # Mock send
            print(f"SENDING ALERT to {alert.target_user_email}: {alert.title} - {alert.message}")
            alert.status = AlertStatus.SENT
            alert.sent_at = datetime.utcnow()
            await alert.save()

alert_service = AlertService()
