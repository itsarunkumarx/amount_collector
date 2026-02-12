import asyncio
from app.core.database import init_db
from app.models.case import MoneyCase
from app.models.user import User
from beanie.operators import Or

async def main():
    await init_db()
    
    email = "arunkumarpalani74@gmail.com"
    user = await User.find_one(User.email == email)
    if not user:
        print(f"User {email} not found")
        return

    print(f"User: {user.full_name} ({user.email}) ID: {user.id}")

    # Test the query
    # Logic in endpoint:
    # user_cases = await MoneyCase.find(
    #     (MoneyCase.lender.id == current_user.id) | 
    #     (MoneyCase.borrower_email == current_user.email)
    # ).project(MoneyCase.id).to_list()

    # Broken down
    print(f"\nChecking cases for borrower_email: {user.email}")
    borrower_cases = await MoneyCase.find(MoneyCase.borrower_email == user.email).to_list()
    print(f"Found {len(borrower_cases)} cases where user is borrower.")
    for c in borrower_cases:
        print(f" - Case ID: {c.id}, Borrower: {c.borrower_email}")

    print(f"\nChecking cases for lender.id: {user.id}")
    lender_cases = await MoneyCase.find(MoneyCase.lender.id == user.id).to_list()
    print(f"Found {len(lender_cases)} cases where user is lender.")

    print("\nChecking Combined OR Query...")
    try:
        # Replicating the logic in transactions.py
        # Beanie supports | operator for Or
        user_cases = await MoneyCase.find(
            Or(
                MoneyCase.lender.id == user.id,
                MoneyCase.borrower_email == user.email
            )
        ).to_list()
        print(f"Found {len(user_cases)} cases with OR query.")
    except Exception as e:
        print(f"Error in OR query: {e}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
