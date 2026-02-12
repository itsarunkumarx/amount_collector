from fastapi.testclient import TestClient
from app.core.database import init_db
from app.models.user import User
from app.api import deps
from main import app
import asyncio

# Mock user
async def override_get_current_active_user():
    user = await User.find_one(User.email == "arunkumarpalani74@gmail.com")
    if not user:
        # Fallback if specific user not found, get any admin/lender
        user = await User.find_one({}) 
    return user

app.dependency_overrides[deps.get_current_active_user] = override_get_current_active_user

client = TestClient(app)

def test_duplicate_creation():
    # 1. Create Case 1
    payload = {
        "borrower_name": "Unique Test",
        "borrower_email": "unique_test@example.com",
        "borrower_phone": "9998887776",
        "amount_lent": 5000,
        "amount_pending": 5000,
        "proof_documents": []
    }
    
    print("Attempting to create Case 1...")
    response1 = client.post("/api/v1/cases/", json=payload)
    print(f"Response 1: {response1.status_code} - {response1.json()}")
    
    # 2. Create Case 2 (Duplicate)
    print("Attempting to create Case 2 (Duplicate)...")
    response2 = client.post("/api/v1/cases/", json=payload)
    print(f"Response 2: {response2.status_code} - {response2.json()}")
    
    if response2.status_code == 400 and "exists" in response2.text:
        print("SUCCESS: Duplicate case blocked.")
    else:
        print("FAILURE: Duplicate case NOT blocked.")

async def setup():
    await init_db()

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(setup())
    test_duplicate_creation()
