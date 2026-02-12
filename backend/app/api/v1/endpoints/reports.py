from typing import Any, List, Dict
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.api import deps
from app.models.user import User, UserRole
from app.models.case import MoneyCase, CaseStatus
from app.models.transaction import Transaction, TransactionType
from app.services.pdf_service import pdf_service
from pydantic import BaseModel
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/export", response_class=StreamingResponse)
async def export_transactions_pdf(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Export User Transactions as PDF.
    """
    # 1. Fetch Transactions
    if current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        transactions = await Transaction.find_all(fetch_links=True).sort(-Transaction.created_at).to_list()
    elif current_user.role == UserRole.TEAM_WORKER:
        transactions = await Transaction.find(Transaction.performed_by.id == current_user.id, fetch_links=True).sort(-Transaction.created_at).to_list()
    else:
        # Lenders/Borrowers logic could be added here
        # For now let's assume Lender seeing their case transactions
        # Simplify: fetch transactions for lender's cases
        user_cases = await MoneyCase.find(MoneyCase.lender.id == current_user.id).project(MoneyCase.id).to_list()
        case_ids = [c.id for c in user_cases]
        transactions = await Transaction.find(Transaction.case.id == {"$in": case_ids}, fetch_links=True).sort(-Transaction.created_at).to_list()

    # 2. Generate PDF
    pdf_buffer = pdf_service.generate_transaction_statement(transactions, current_user.full_name)
    
    # 3. Return as File
    filename = f"Statement_{current_user.full_name.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

class DashboardStats(BaseModel):
    total_users: int = 0
    total_workers: int = 0
    total_cases: int = 0
    total_lent: float = 0.0
    total_collected: float = 0.0
    total_pending: float = 0.0
    collected_today: float = 0.0
    active_cases: int = 0
    pending_verification_cases: int = 0

@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get statistics for dashboard based on user role.
    """
    stats = DashboardStats()
    
    # Base query for cases
    if current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        cases = await MoneyCase.find_all().to_list()
        stats.total_users = await User.find(User.role == UserRole.VERIFIED_USER).count()
        stats.total_workers = await User.find(User.role == UserRole.TEAM_WORKER).count()
    elif current_user.role == UserRole.TEAM_WORKER:
        # Workers see cases assigned to them
        cases = await MoneyCase.find(MoneyCase.assigned_worker.id == current_user.id).to_list()
    else:
        # Verified Users see their own cases
        cases = await MoneyCase.find(MoneyCase.lender.id == current_user.id).to_list()

    stats.total_cases = len(cases)
    
    for case in cases:
        stats.total_lent += case.amount_lent
        stats.total_pending += case.amount_pending
        if case.status == CaseStatus.ACTIVE:
            stats.active_cases += 1
        elif case.status == CaseStatus.PENDING_VERIFICATION:
            stats.pending_verification_cases += 1
            
    # Calculate collected total
    stats.total_collected = stats.total_lent - stats.total_pending

    # Calculate Collected Today
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    
    tx_query = {
        Transaction.created_at: {"$gte": today_start},
        Transaction.transaction_type: TransactionType.PAYMENT
    }
    
    # Filter transactions based on role
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
         if current_user.role == UserRole.TEAM_WORKER:
             tx_query["performed_by._id"] = current_user.id
         else:
             # Lenders see payments for their cases
             case_ids = [c.id for c in cases]
             tx_query["case._id"] = {"$in": case_ids}

    todays_txs = await Transaction.find(tx_query).to_list()
    stats.collected_today = sum(tx.amount for tx in todays_txs)
    
    return stats

class DailyReport(BaseModel):
    date: str
    collected: float
    count: int

@router.get("/reports/daily-collection", response_model=List[DailyReport])
async def get_daily_collection_report(
    days: int = 7,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get daily collection report for the last N days.
    """
    start_date = datetime.utcnow() - timedelta(days=days)
    
    query = {
        Transaction.created_at: {"$gte": start_date},
        Transaction.transaction_type: TransactionType.PAYMENT
    }
    
    # Filter for non-admins
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
         if current_user.role == UserRole.TEAM_WORKER:
             query["performed_by._id"] = current_user.id
         else:
             # For Lenders, we need to join cases, but Beanie find is simpler.
             # We fetch user's cases first to get case IDs
             user_cases = await MoneyCase.find(MoneyCase.lender.id == current_user.id).project(MoneyCase.id).to_list()
             case_ids = [c.id for c in user_cases]
             query["case._id"] = {"$in": case_ids}

    transactions = await Transaction.find(query).to_list()
    
    # Aggregate in memory (Beanie/Mongo aggregation is better but this is simpler for MVP)
    report_data: Dict[str, DailyReport] = {}
    
    for tx in transactions:
        date_str = tx.created_at.strftime("%Y-%m-%d")
        if date_str not in report_data:
            report_data[date_str] = DailyReport(date=date_str, collected=0, count=0)
        
        report_data[date_str].collected += tx.amount
        report_data[date_str].count += 1
        
    return sorted(report_data.values(), key=lambda x: x.date, reverse=True)
