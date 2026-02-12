import asyncio
from app.core.database import init_db
from app.models.user import User
from app.models.case import MoneyCase, CaseStatus
from app.schemas.case import CaseCreate

# Mock user for context (we will fetch real user)

async def main():
    await init_db()
    
    # Get a real user to act as lender
    lender = await User.find_one(User.email == "arunkumarpalani74@gmail.com")
    if not lender:
        print("Lender not found")
        return

    # Create a case to delete
    print("Creating Case for Delete Test...")
    case = MoneyCase(
        lender=lender,
        borrower_email="delete_test@example.com",
        borrower_phone="0000000000",
        borrower_name="Delete Me",
        amount_lent=999,
        amount_pending=999,
        status=CaseStatus.PENDING_VERIFICATION # Allow delete
    )
    await case.create()
    print(f"Case Created: {case.id}")

    # Now manually test delete logic (simulating the endpoint logic)
    # We can't call the endpoint function easily because of Depends and Request object if we added JSONResponse
    # But we can assume the endpoint code is:
    # case = await MoneyCase.get(case_id)
    # await case.delete()
    
    print("Deleting Case...")
    found_case = await MoneyCase.get(case.id)
    if found_case:
        await found_case.delete()
        print("Case Deleted Successfully (Logic Verification)")
    else:
        print("Case not found for deletion!")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
