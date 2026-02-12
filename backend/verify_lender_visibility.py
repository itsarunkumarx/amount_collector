import asyncio
from app.core.database import init_db
from app.models.user import User
from app.models.case import MoneyCase
from app.core.user_roles import UserRole

async def verify():
    await init_db()
    
    # 1. Create a Lender User
    email = "test_lender_debug@example.com"
    user = await User.find_one(User.email == email)
    if not user:
        user = User(
            email=email,
            hashed_password="hashed_secret",
            full_name="Test Lender Debug",
            role=UserRole.VERIFIED_USER,
            phone_number="1112223333",
            is_verified=True
        )
        await user.create()
        print(f"Created lender: {user.id}")
    else:
        print(f"Found lender: {user.id}")

    # 2. Create a Case
    case = MoneyCase(
        lender=user,
        borrower_name="Debug Borrower",
        borrower_email="debug@example.com",
        borrower_phone="000",
        amount_lent=1000,
        amount_pending=1000
    )
    await case.create()
    print(f"Created case: {case.id}")

    # 3. Query Cases using ID comparison (current logic)
    print("Querying usage: MoneyCase.lender.id == user.id")
    cases_id = await MoneyCase.find(MoneyCase.lender.id == user.id).to_list()
    print(f"Found cases (by ID): {len(cases_id)}")

    # 4. Query Cases using Link comparison (alternative)
    print("Querying usage: MoneyCase.lender == user")
    try:
        cases_link = await MoneyCase.find(MoneyCase.lender == user).to_list()
        print(f"Found cases (by Link): {len(cases_link)}")
    except Exception as e:
        print(f"Query by Link failed: {e}")

    # 5. Query Cases using Raw DBRef
    print("Querying usage: {'lender.$id': user.id}")
    try:
        cases_raw = await MoneyCase.find({"lender.$id": user.id}).to_list()
        print(f"Found cases (Raw): {len(cases_raw)}")
    except Exception as e:
        print(f"Query Raw failed: {e}")

if __name__ == "__main__":
    asyncio.run(verify())
