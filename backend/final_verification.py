import asyncio
import httpx
from datetime import datetime

# Configuration
API_URL = "http://127.0.0.1:8080/api/v1"
ADMIN_EMAIL = "arunkumarpalani428@gmail.com"
ADMIN_PASS = "Arunkumar@2006"
USER_EMAIL = "user@antigravity.com"  # Existing verified user
USER_PASS = "user123"
WORKER_EMAIL = "teamworker@antigravity.com"
WORKER_PASS = "worker123"

async def login(client, email, password):
    response = await client.post(f"{API_URL}/auth/login", data={"username": email, "password": password})
    if response.status_code != 200:
        print(f"❌ Login failed for {email}: {response.text}")
        return None
    return response.json()["access_token"]

async def run_verification():
    async with httpx.AsyncClient() as client:
        print("🚀 Starting End-to-End Verification...")

        # 1. Login as Admin to check system health
        print("\n🔹 Step 1: Admin System Check")
        admin_token = await login(client, ADMIN_EMAIL, ADMIN_PASS)
        if not admin_token: return
        
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        stats = await client.get(f"{API_URL}/reports/dashboard-stats", headers=headers_admin)
        if stats.status_code == 200:
            print(f"✅ Admin Stats fetched: {stats.json()}")
        else:
            print(f"❌ Admin Stats failed: {stats.text}")

        # 1.5 Admin Verifies User (Ensure they are VERIFIED_USER)
        print("\n🔹 Step 1.5: Admin Verifies Lender")
        # Find user first
        print("Debugging: Fetching all users...")
        all_users_res = await client.get(f"{API_URL}/users/", headers=headers_admin)
        print(f"Debug: Users Status: {all_users_res.status_code}")
        # print(f"Debug: Users Body: {all_users_res.text}")
        
        all_users = all_users_res.json()
        if isinstance(all_users, list):
             target_user = next((u for u in all_users if isinstance(u, dict) and u.get('email') == USER_EMAIL), None)
        else:
             print(f"❌ Unexpected response format for users: {type(all_users)}")
             target_user = None

        if target_user:
            verify_res = await client.put(f"{API_URL}/users/{target_user['id']}/verify", headers=headers_admin)
            if verify_res.status_code == 200:
                print(f"✅ User {USER_EMAIL} is now VERIFIED")
            else:
                print(f"⚠️ User verification warning: {verify_res.text}")
        else:
             print("❌ User not found for verification")

        # 2. Login as Lender (User) and Create Case with Worker Assignment
        print("\n🔹 Step 2: Lender Creates Case & Assigns Worker")
        user_token = await login(client, USER_EMAIL, USER_PASS)
        if not user_token: return
        headers_user = {"Authorization": f"Bearer {user_token}"}

        # First, lender needs to find the worker ID
        workers_res = await client.get(f"{API_URL}/users/workers", headers=headers_user)
        print(f"Debug: Workers Status: {workers_res.status_code}")
        workers = workers_res.json()
        
        if workers_res.status_code != 200 or not workers or not isinstance(workers, list):
            print(f"❌ No workers found or invalid format: {workers_res.text}")
            return
        
        worker_id = workers[0]['id']
        print(f"✅ Found Worker: {workers[0]['full_name']} ({worker_id})")

        # Create Case
        case_payload = {
            "borrower_email": "borrower@test.com",
            "borrower_phone": "9876543210",
            "borrower_name": "Test Borrower",
            "amount_lent": 5000,
            "interest_rate": 5.0,
            "assigned_worker_id": worker_id,
            "due_date": datetime.now().isoformat()
        }
        case_res = await client.post(f"{API_URL}/cases/", json=case_payload, headers=headers_user)
        if case_res.status_code != 200:
            print(f"❌ Case creation failed: {case_res.text}")
            return
        
        case_data = case_res.json()
        case_id = case_data['id']
        print(f"✅ Case Created: ID {case_id} for Borrower {case_data['borrower_name']}")

        # 3. Admin Activates Case (since status is PENDING_VERIFICATION)
        print("\n🔹 Step 3: Admin Verifies Case")
        # Admin verify
        verify_res = await client.put(f"{API_URL}/cases/{case_id}/status", json={"status": "ACTIVE"}, headers=headers_admin)
        if verify_res.status_code == 200:
            print(f"✅ Case {case_id} Verified by Admin")
        else:
            print(f"❌ Case verification failed: {verify_res.text}")

        # 4. Worker Logs in and Collects Money
        print("\n🔹 Step 4: Worker Collects Payment")
        worker_token = await login(client, WORKER_EMAIL, WORKER_PASS)
        if not worker_token: return
        headers_worker = {"Authorization": f"Bearer {worker_token}"}

        # Verify worker can see the case
        worker_cases = await client.get(f"{API_URL}/cases/", headers=headers_worker)
        my_case = next((c for c in worker_cases.json() if c['id'] == case_id), None)
        
        if my_case:
            print(f"✅ Worker sees assigned case: {my_case['borrower_name']}")
        else:
            print("❌ Worker CANNOT see the assigned case! Check permissions/endpoints.")
            return

        # Perform Collection
        collection_payload = {
            "case_id": case_id,
            "amount": 1000,
            "transaction_type": "PAYMENT",
            "payment_mode": "CASH",
            "notes": "Collected at borrower home"
        }
        trans_res = await client.post(f"{API_URL}/transactions/", json=collection_payload, headers=headers_worker)
        if trans_res.status_code == 200:
            print(f"✅ Collection Recorded: ${collection_payload['amount']}")
        else:
            print(f"❌ Collection failed: {trans_res.text}")
            return

        # 5. User checks Transaction History
        print("\n🔹 Step 5: Lender Verifies Transaction")
        history_res = await client.get(f"{API_URL}/transactions/", headers=headers_user)
        if history_res.status_code == 200:
            # Check if our new transaction is there
            txs = history_res.json()
            found = any(t['case_id'] == case_id and t['amount'] == 1000 for t in txs)
            if found:
                print("✅ Transaction found in Lender's history")
            else:
                print("❌ Transaction NOT found in Lender's history")
        else:
            print(f"❌ Failed to fetch transactions: {history_res.text}")

        print("\n🎉 End-to-End Verification Complete!")

if __name__ == "__main__":
    asyncio.run(run_verification())
