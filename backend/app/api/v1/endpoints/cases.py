from datetime import datetime
from typing import List, Any
from fastapi import APIRouter, Depends, HTTPException, status
from app.api import deps
from app.models.user import User
from app.models.case import MoneyCase, CaseStatus
from app.schemas.case import CaseCreate, CaseResponse, CaseUpdate
from app.core.user_roles import UserRole

router = APIRouter()

@router.post("/", response_model=CaseResponse)
async def create_case(
    case_in: CaseCreate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create a new money lending case.
    Only Verified Users (Lenders) can create cases.
    """
    # Optional: Check if user is verified lender
    try:
        worker_ref = None
        if case_in.assigned_worker_id:
            if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
                raise HTTPException(
                    status_code=403,
                    detail="Only admins can assign workers. Lenders must submit cases for verification first."
                )
            worker_ref = await User.get(case_in.assigned_worker_id)
            if not worker_ref:
                raise HTTPException(status_code=404, detail="Assigned worker not found")
            if worker_ref.role != UserRole.TEAM_WORKER:
                 raise HTTPException(status_code=400, detail="Assigned user is not a field worker")

        # Check for existing active cases for this borrower
        from beanie.operators import Or
        existing_case = await MoneyCase.find_one(
            Or(
                MoneyCase.borrower_email == case_in.borrower_email,
                MoneyCase.borrower_phone == case_in.borrower_phone
            ),
            {"status": {"$nin": [CaseStatus.COMPLETED, CaseStatus.REJECTED]}}
        )
        if existing_case:
            raise HTTPException(
                status_code=400, 
                detail=f"An active case already exists for this borrower ({existing_case.borrower_name}). Please complete it first."
            )


        case = MoneyCase(
            lender=current_user,
            borrower_email=case_in.borrower_email,
            borrower_phone=case_in.borrower_phone,
            borrower_name=case_in.borrower_name,
            amount_lent=case_in.amount_lent,
            amount_pending=case_in.amount_lent, # Initially pending = lent
            interest_rate=case_in.interest_rate,
            proof_documents=case_in.proof_documents,
            status=CaseStatus.PENDING_VERIFICATION,
            assigned_worker=worker_ref,
            due_date=case_in.due_date,
            bank_name=case_in.bank_name,
            account_number=case_in.account_number,
            ifsc_code=case_in.ifsc_code
        )
        await case.create()
        
        return CaseResponse(
            id=str(case.id),
            lender_id=str(current_user.id),
            assigned_worker_id=str(case.assigned_worker.id) if case.assigned_worker else None,
            **case.dict(exclude={'id', 'lender', 'assigned_worker'})
        )
    except Exception as e:
        with open("debug_create_error.log", "w") as f:
             f.write(f"Create Case failed: {str(e)}\n")
             import traceback
             traceback.print_exc(file=f)
        raise e

@router.get("/", response_model=List[CaseResponse])
async def read_cases(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve cases.
    Admins see all.
    Lenders see their own.
    """
    if current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        cases = await MoneyCase.find_all().skip(skip).limit(limit).to_list()
    elif current_user.role == UserRole.TEAM_WORKER:
        # Workers see cases assigned to them OR created by them
        from beanie.operators import Or
        cases = await MoneyCase.find(
            Or(
                MoneyCase.assigned_worker.id == current_user.id,
                MoneyCase.lender.id == current_user.id
            )
        ).skip(skip).limit(limit).to_list()
    else:
        # Link comparison is safer - using raw DBRef query
        from bson import ObjectId
        lid = ObjectId(str(current_user.id))
        cases = await MoneyCase.find({"lender.$id": lid}).skip(skip).limit(limit).to_list()
        
    return [
        CaseResponse(
            id=str(c.id),
            lender_id=str(c.lender.ref.id) if c.lender and hasattr(c.lender, 'ref') else str(c.lender.id) if c.lender else "",
            assigned_worker_id=(str(c.assigned_worker.ref.id) if hasattr(c.assigned_worker, 'ref') else str(c.assigned_worker.id)) if c.assigned_worker else None,
            **c.dict(exclude={'id', 'lender', 'assigned_worker'})
        )
        for c in cases
    ]


@router.get("/{case_id}", response_model=CaseResponse)
async def read_case(
    case_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    case = await MoneyCase.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Permission check
    is_admin = current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    
    is_lender = False
    if case.lender:
        # Handle Beanie Link or direct object
        l_id = case.lender.ref.id if hasattr(case.lender, 'ref') else case.lender.id
        is_lender = (l_id == current_user.id)
        
    is_assigned = False
    if case.assigned_worker:
        # Handle Beanie Link or direct object
        w_id = case.assigned_worker.ref.id if hasattr(case.assigned_worker, 'ref') else case.assigned_worker.id
        is_assigned = (w_id == current_user.id)
    
    if not (is_admin or is_lender or is_assigned):
        raise HTTPException(status_code=400, detail="Not enough permissions")
        
    return CaseResponse(
        id=str(case.id),
        lender_id=str(case.lender.ref.id) if case.lender and hasattr(case.lender, 'ref') else str(case.lender.id) if case.lender else "",
        **case.dict(exclude={'id', 'lender'})
    )

@router.put("/{case_id}/status", response_model=CaseResponse)
async def update_case_status(
    case_id: str,
    case_update: CaseUpdate,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update case status. Only Admins can verify/reject.
    """
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPER_ADMIN]:
        raise HTTPException(status_code=400, detail="Not enough permissions")
        
    case = await MoneyCase.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if case_update.status:
        if case_update.status == CaseStatus.REJECTED:
            # If rejected, delete the case
            await case.delete()
            return CaseResponse(
                id=str(case.id),
                lender_id=str(case.lender.ref.id) if hasattr(case.lender, 'ref') else str(case.lender.id),
                status=CaseStatus.REJECTED,
                borrower_email=case.borrower_email,
                borrower_phone=case.borrower_phone,
                borrower_name=case.borrower_name,
                amount_lent=case.amount_lent,
                amount_pending=case.amount_pending,
                created_at=case.created_at,
                updated_at=datetime.utcnow()
            )
        case.status = case_update.status

    if case_update.admin_verification_notes:
        case.admin_verification_notes = case_update.admin_verification_notes
    if case_update.amount_pending is not None:
        case.amount_pending = case_update.amount_pending
    if case_update.assigned_worker_id:
        worker = await User.get(case_update.assigned_worker_id)
        if worker and worker.role == UserRole.TEAM_WORKER:
            case.assigned_worker = worker
        
    await case.save()
    
    return CaseResponse(
        id=str(case.id),
        lender_id=str(case.lender.ref.id) if case.lender and hasattr(case.lender, 'ref') else str(case.lender.id) if case.lender else "",
        assigned_worker_id=(str(case.assigned_worker.ref.id) if hasattr(case.assigned_worker, 'ref') else str(case.assigned_worker.id)) if case.assigned_worker else None,
        **case.dict(exclude={'id', 'lender', 'assigned_worker'})
    )
@router.delete("/{case_id}", response_model=dict)
async def delete_case(
    case_id: str,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Delete a case.
    Only permitted if case is COMPLETED or user is Admin.
    """
    case = await MoneyCase.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    is_admin = current_user.role in [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    is_lender = (case.lender.id == current_user.id) if case.lender else False
    
    # Allow delete if Admin OR (Lender AND Case is limit states)
    # Allow delete if Admin OR (Lender AND Case is limit states)
    if not (is_admin or (is_lender and case.status in [CaseStatus.COMPLETED, CaseStatus.REJECTED, CaseStatus.PENDING_VERIFICATION])):
         raise HTTPException(status_code=400, detail="Cannot delete active cases unless you are Admin")

    try:
        await case.delete()
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=200, content={"message": "Case deleted successfully"}, headers={"Access-Control-Allow-Origin": "*"})
    except Exception as e:
        import traceback
        with open("debug_delete_error.log", "w") as f:
             f.write(f"Delete Failed: {str(e)}\n")
             traceback.print_exc(file=f)
        raise HTTPException(status_code=500, detail="Internal Server Error during delete")


@router.post("/{case_id}/alert", response_model=dict)
async def send_case_alert(
    case_id: str,
    message: str = None,
    current_user: User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Send an alert (SMS/Notification) to the borrower of this case.
    """
    case = await MoneyCase.get(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
        
    # Check permissions (Any related user can nudge)
    
    from app.services.alert_service import alert_service
    
    msg = message or f"Reminder: Payment of {case.amount_pending} is pending for your case."
    
    await alert_service.create_alert(
        target_email=case.borrower_email,
        target_phone=case.borrower_phone,
        title="Payment Reminder",
        message=msg,
        severity="WARNING",
        case_id=str(case.id)
    )
    
    return {"message": f"Alert sent to {case.borrower_phone}"}
