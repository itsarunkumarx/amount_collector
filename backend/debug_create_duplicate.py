import asyncio
from app.core.database import init_db
from app.models.user import User
from app.models.case import MoneyCase, CaseStatus
from app.schemas.case import CaseCreate
from app.api.v1.endpoints.cases import create_case

# Mock dependency
class MockUser:
    id = "507f1f77bcf86cd799439011" 
    role = "ADMIN"
    email = "admin@example.com"
    full_name = "Admin User"

async def main():
    await init_db()
    
    # Get a real user to act as lender
    lender = await User.find_one(User.email == "arunkumarpalani74@gmail.com")
    if not lender:
        lender = await User.find_one({})

    print(f"Lender: {lender.email}")

    case_in = CaseCreate(
        borrower_name="Duplicate Tester",
        borrower_email="duplicate@test.com",
        borrower_phone="1234567890",
        amount_lent=1000,
        amount_pending=1000,
        proof_documents=[]
    )

    print("Creating Case 1...")
    try:
        # We need to manually construct the case since we can't easily call the API function directly with Depends
        # So we emulate the logic inside create_case
        case1 = MoneyCase(
            lender=lender,
            borrower_email=case_in.borrower_email,
            borrower_phone=case_in.borrower_phone,
            borrower_name=case_in.borrower_name,
            amount_lent=case_in.amount_lent,
            amount_pending=case_in.amount_lent,
            status=CaseStatus.PENDING_VERIFICATION
        )
        await case1.create()
        print(f"Case 1 Created: {case1.id}")
    except Exception as e:
        print(f"Case 1 Failed: {e}")

    print("Creating Case 2 (Same Data)...")
    try:
        case2 = MoneyCase(
            lender=lender,
            borrower_email=case_in.borrower_email,
            borrower_phone=case_in.borrower_phone,
            borrower_name=case_in.borrower_name,
            amount_lent=case_in.amount_lent,
            amount_pending=case_in.amount_lent,
            status=CaseStatus.PENDING_VERIFICATION
        )
        await case2.create()
        print(f"Case 2 Created: {case2.id}")
    except Exception as e:
        print(f"Case 2 Failed: {e}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
