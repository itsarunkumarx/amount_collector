import asyncio
import os
from app.core.database import init_db
from app.models.transaction import Transaction

async def main():
    await init_db()
    count = await Transaction.count()
    print(f"Total Transactions: {count}")
    
    # Also print the last 5 transactions to verify
    if count > 0:
        txs = await Transaction.find_all().limit(5).to_list()
        for t in txs:
            print(f"- {t.transaction_type}: {t.amount} ({t.performed_by.id if t.performed_by else 'NoUser'})")

if __name__ == "__main__":
    asyncio.run(main())
