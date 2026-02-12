from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException
from app.api import deps
from app.models.user import User
from app.models.case import MoneyCase
from app.models.transaction import Transaction
from app.schemas.transaction import TransactionCreate, TransactionResponse
from app.core.user_roles import UserRole
from beanie.operators import Or

router = APIRouter()

@router.post("/", response_model=TransactionResponse)
async def create_transaction(
    transaction_in: TransactionCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new transaction.
    """
    case = await MoneyCase.get(transaction_in.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Permission check
    is_admin = current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    
    is_lender = False
    if case.lender:
        l_id = case.lender.ref.id if hasattr(case.lender, 'ref') else case.lender.id
        is_lender = (l_id == current_user.id)
        
    is_assigned = False
    if case.assigned_worker:
        w_id = case.assigned_worker.ref.id if hasattr(case.assigned_worker, 'ref') else case.assigned_worker.id
        is_assigned = (w_id == current_user.id)

    if not (is_admin or is_lender or is_assigned):
            # Borrowers technically can upload proof, so maybe allow them if they are the borrower?
            # For now, restrict to Lender/Admin/Worker
            if transaction_in.proof_url and current_user.email == case.borrower_email:
                pass # Allow borrower to upload proof
            else:
                raise HTTPException(status_code=400, detail="Not authorized")

    transaction = Transaction(
        case=case,
        performed_by=current_user,
        amount=transaction_in.amount,
        transaction_type=transaction_in.transaction_type,
        proof_url=transaction_in.proof_url,
        payment_mode=transaction_in.payment_mode,
        notes=transaction_in.notes
    )
    await transaction.create()
    
    # Update Case Amount Pending if it's a payment
    if transaction_in.transaction_type == "PAYMENT":
        case.amount_pending -= transaction_in.amount
        if case.amount_pending <= 0:
            case.status = "COMPLETED" # Or wait for admin verify?
            case.amount_pending = 0
        await case.save()
        
    return TransactionResponse(
        id=str(transaction.id),
        performed_by_id=str(current_user.id),
        performed_by_name=current_user.full_name or current_user.email,
        case_id=str(case.id),
        **transaction.dict(exclude={'id', 'performed_by', 'case'})
    )

@router.get("/", response_model=List[TransactionResponse])
async def read_transactions(
    case_id: str = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    # If case_id provided, return transactions for that case
    if case_id:
        # Check permissions for case
        case = await MoneyCase.get(case_id)
        if not case:
             raise HTTPException(status_code=404, detail="Case not found")
             
        if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            if case.lender.id != current_user.id and current_user.email != case.borrower_email:
                raise HTTPException(status_code=400, detail="Not authorized")
                
        transactions = await Transaction.find(Transaction.case.id == case.id).to_list()
    else:
        # Return all transactions visible to user
        if current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
            transactions = await Transaction.find_all().to_list()
        elif current_user.role == UserRole.TEAM_WORKER:
             # Workers see transactions they performed
             transactions = await Transaction.find(Transaction.performed_by.id == current_user.id).to_list()
        else:
             # Lenders see transactions for their cases. 
             # Borrowers see transactions for cases where they are the borrower.
             user_cases = await MoneyCase.find(
                 Or(
                     MoneyCase.lender.id == current_user.id,
                     MoneyCase.borrower_email == current_user.email
                 )
             ).project(MoneyCase.id).to_list()
             
             case_ids = [c.id for c in user_cases]
             transactions = await Transaction.find(Transaction.case.id == {"$in": case_ids}).to_list()
    return [
        TransactionResponse(
            id=str(t.id),
            performed_by_id=str(t.performed_by.id) if t.performed_by else "",
            **t.dict(exclude={'id', 'performed_by', 'case'})
        )
        for t in transactions
    ]

@router.delete("/{transaction_id}", status_code=200)
async def delete_transaction(
    transaction_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Revert/Delete a transaction.
    If it was a PAYMENT, the amount is added back to case.amount_pending.
    """
    try:
        transaction = await Transaction.get(transaction_id, fetch_links=True)
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
            
        # Permission check: Only Admin or the person who performed it (maybe optional)
        if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
             raise HTTPException(status_code=400, detail="Only Admins can revert transactions")
    
        # Handle Linked Case
        # When using fetch_links=True, transaction.case should be the document.
        # But if it fails, we might need manual fetch.
        
        # Accessing .case directly might be the issue if fetch_links failed or behaved unexpectedly.
        case = transaction.case
        
        if transaction.transaction_type == "PAYMENT":
            # Revert the payment
            case.amount_pending += transaction.amount
            # If case was COMPLETED, make it ACTIVE
            if case.status == "COMPLETED":
                case.status = "ACTIVE"
            await case.save()
            
        await transaction.delete()
        return {"message": "Transaction reverted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        with open("debug_revert_error.log", "w") as f:
            f.write(f"Revert Transaction Error: {str(e)}\n")
            traceback.print_exc(file=f)
        raise HTTPException(status_code=500, detail="Internal Server Error")
