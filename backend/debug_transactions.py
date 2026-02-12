import asyncio
from app.core.database import init_db
from app.models.transaction import Transaction
from app.models.user import User
from app.models.case import MoneyCase
from beanie import Link

async def main():
    await init_db()
    
    print("--- Users ---")
    users = await User.find_all().to_list()
    for u in users:
        print(f"User: {u.full_name} ({u.email}) - Role: {u.role} - ID: {u.id}")
        
    print("\n--- Cases ---")
    cases = await MoneyCase.find_all().to_list()
    # Collect case IDs to verify transaction links
    case_ids = [c.id for c in cases]
    
    for c in cases:
        lender_id = "N/A"
        if c.lender:
            if isinstance(c.lender, Link):
                lender_id = c.lender.ref.id
            else:
                lender_id = c.lender.id
                
        print(f"Case ID: {c.id} - Lender ID: {lender_id} - Borrower: {c.borrower_email}")

    print("\n--- Transactions ---")
    transactions = await Transaction.find_all().to_list()
    if not transactions:
        print("No transactions found in DB.")
    for t in transactions:
        case_id = "N/A"
        if t.case:
             if isinstance(t.case, Link):
                case_id = t.case.ref.id
             else:
                case_id = t.case.id
        
        print(f"ID: {t.id} - Type: {t.transaction_type} - Amount: {t.amount} - Case ID: {case_id}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
