import requests
import sys
import time

BASE_URL = "http://localhost:8080/api/v1"
ADMIN_EMAIL = "arunkumarpalani428@gmail.com"
ADMIN_PASS = "Arunkumar@2006"

WORKER_EMAIL = "revert_test_worker@example.com"
WORKER_PASS = "password123"

def run_test():
    session = requests.Session()
    
    # 1. Login as Admin
    print("Logging in as Admin...")
    admin_login = session.post(f"{BASE_URL}/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASS})
    if admin_login.status_code != 200:
        print("Admin login failed")
        sys.exit(1)
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    
    # 2. Register/Get Worker
    session.post(f"{BASE_URL}/auth/register", json={
        "email": WORKER_EMAIL,
        "password": WORKER_PASS,
        "full_name": "Revert Test Worker",
        "phone_number": "1112223333",
        "role": "TEAM_WORKER"
    })
    
    # Login as Worker to get ID/Token
    worker_login = session.post(f"{BASE_URL}/auth/login", data={"username": WORKER_EMAIL, "password": WORKER_PASS})
    worker_data = worker_login.json()
    worker_headers = {"Authorization": f"Bearer {worker_data['access_token']}"}
    worker_id = worker_data["user_id"]
    
    # 3. Create Case
    print("Creating Case...")
    case_res = session.post(f"{BASE_URL}/cases/", headers=admin_headers, json={
        "borrower_name": "Revert Borrower",
        "borrower_email": "revert@test.com",
        "borrower_phone": "1231231234",
        "amount_lent": 1000,
        "due_date": "2026-12-31T00:00:00",
        "assigned_worker_id": worker_id
    })
    case_id = case_res.json()["id"]
    print(f"Case Created: {case_id} (Amount: 1000)")
    
    # 4. Create Transaction (Collection of 100)
    print("Creating Collection (100)...")
    trans_res = requests.post(f"{BASE_URL}/transactions/", headers=worker_headers, json={
        "case_id": case_id,
        "amount": 100,
        "transaction_type": "PAYMENT"
    })
    if trans_res.status_code != 200:
        print(f"Failed to create transaction: {trans_res.text}")
        sys.exit(1)
    trans_id = trans_res.json()["id"]
    print(f"Transaction Created: {trans_id}")
    
    # Verify Pending Amount
    case_check = session.get(f"{BASE_URL}/cases/{case_id}", headers=admin_headers).json()
    print(f"Pending Amount after collection: {case_check['amount_pending']} (Expected 900)")
    if case_check['amount_pending'] != 900:
        print("ERROR: Pending amount incorrect")
        
    # 5. Revert Transaction (As Admin)
    print("Reverting Transaction...")
    revert_res = requests.delete(f"{BASE_URL}/transactions/{trans_id}", headers=admin_headers)
    if revert_res.status_code != 200:
         print(f"Revert failed: {revert_res.text}")
         sys.exit(1)
    print("Revert Success")
    
    # Verify Pending Amount Restored
    case_final = session.get(f"{BASE_URL}/cases/{case_id}", headers=admin_headers).json()
    print(f"Pending Amount after revert: {case_final['amount_pending']} (Expected 1000)")
    
    if case_final['amount_pending'] == 1000:
        print("SUCCESS: Transaction Reverted and Amount Restored.")
    else:
        print("FAILURE: Amount not restored correctly.")

if __name__ == "__main__":
    run_test()
