import requests
import sys

BASE_URL = "http://localhost:8080/api/v1"
ADMIN_EMAIL = "arunkumarpalani428@gmail.com"
ADMIN_PASS = "Arunkumar@2006"

# A worker that we know exists or we create one
WORKER_EMAIL = "verify_access_worker@example.com"
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
    
    # 2. Create/Get Worker
    print("Ensuring Worker exists...")
    worker_res = session.post(f"{BASE_URL}/auth/register", json={
        "email": WORKER_EMAIL,
        "password": WORKER_PASS,
        "full_name": "Verify Access Worker",
        "phone_number": "9999999999",
        "role": "TEAM_WORKER"
    })
    
    # Login as Worker to get ID
    print("Logging in as Worker...")
    worker_login = session.post(f"{BASE_URL}/auth/login", data={"username": WORKER_EMAIL, "password": WORKER_PASS})
    if worker_login.status_code != 200:
        print("Worker login failed")
        sys.exit(1)
    worker_data = worker_login.json()
    worker_token = worker_data["access_token"]
    worker_id = worker_data["user_id"]
    worker_headers = {"Authorization": f"Bearer {worker_token}"}
    print(f"Worker ID: {worker_id}")

    # 3. Create Case Assigned to Worker (as Admin)
    print("Creating Case assigned to Worker...")
    case_res = session.post(f"{BASE_URL}/cases/", headers=admin_headers, json={
        "borrower_name": "Test Borrower",
        "borrower_email": "borrower@test.com",
        "borrower_phone": "1231231234",
        "amount_lent": 5000,
        "interest_rate": 2.0,
        "due_date": "2026-12-31T00:00:00",
        "assigned_worker_id": worker_id
    })
    if case_res.status_code != 200:
        print(f"Case create failed: {case_res.text}")
        sys.exit(1)
    case_id = case_res.json()["id"]
    print(f"Case Created: {case_id}")
    
    # 4. Try to Read Case as Worker
    print(f"Worker attempting to read case {case_id}...")
    read_res = requests.get(f"{BASE_URL}/cases/{case_id}", headers=worker_headers)
    
    if read_res.status_code == 200:
        print("SUCCESS: Worker can access the assigned case.")
    else:
        print(f"FAILURE: Worker denied access. Status: {read_res.status_code}, Resp: {read_res.text}")

if __name__ == "__main__":
    run_test()
