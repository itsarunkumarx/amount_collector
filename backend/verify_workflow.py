import requests
import time
import random

BASE_URL = "http://localhost:8080/api/v1"

def random_string():
    return "".join(random.choices("abcdefghijklmnopqrstuvwxyz", k=8))

def register_user(email, password, role, name):
    print(f"Registering {role}: {email}...")
    try:
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": email,
            "password": password,
            "full_name": name,
            "role": role,
            "phone_number": "1234567890",
            "is_active": True
        })
        if resp.status_code == 200:
            print(f"Success: {resp.json()['id']}")
            return resp.json()
        elif "already exists" in resp.text:
            print("User exists, logging in...")
            return None # Handle login later
        else:
            print(f"Failed: {resp.text}")
            return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def login(email, password):
    print(f"Logging in {email}...")
    resp = requests.post(f"{BASE_URL}/auth/login", data={
        "username": email,
        "password": password
    })
    if resp.status_code == 200:
        return resp.json()["access_token"]
    else:
        print(f"Login failed: {resp.text}")
        return None

def main():
    # 1. Setup Users
    suffix = random_string()
    admin_email = f"admin_{suffix}@example.com"
    lender_email = f"lender_{suffix}@example.com"
    worker_email = f"worker_{suffix}@example.com"
    pw = "secret"

    register_user(admin_email, pw, "ADMIN", "Admin User")
    register_user(lender_email, pw, "VERIFIED_USER", "Lender User")
    worker = register_user(worker_email, pw, "TEAM_WORKER", "Field Worker")
    worker_id = worker['id'] if worker else None

    # Get Tokens
    token_admin = login(admin_email, pw)
    token_lender = login(lender_email, pw)
    token_worker = login(worker_email, pw)

    headers_lender = {"Authorization": f"Bearer {token_lender}"}
    headers_admin = {"Authorization": f"Bearer {token_admin}"}
    headers_worker = {"Authorization": f"Bearer {token_worker}"}

    # 2. Lender Creates Case (NO ASSIGNMENT)
    print("\n--- Testing Case Creation (Lender) ---")
    
    # Upload proof
    print("Uploading proof...")
    files = {'file': ('proof.txt', b'This is a proof document')}
    upload_resp = requests.post(f"{BASE_URL}/utils/upload", files=files, headers=headers_lender)
    if upload_resp.status_code != 200:
        print(f"Upload failed: {upload_resp.text}")
        return
    proof_url = upload_resp.json()['url']
    print(f"Proof uploaded: {proof_url}")

    # Create Case
    case_data = {
        "borrower_email": "borrower@example.com",
        "borrower_phone": "555-5555",
        "borrower_name": "John Doe",
        "amount_lent": 1000,
        "interest_rate": 5,
        "due_date": "2026-12-31T00:00:00",
        "proof_documents": [proof_url]
    }
    # Test 1: Lender trying to assign worker (Should FAIL) - Backend check
    cases_fail = case_data.copy()
    cases_fail['assigned_worker_id'] = worker_id
    
    print("Attempting to create case WITH worker as Lender (Expect Failure)...")
    fail_resp = requests.post(f"{BASE_URL}/cases/", json=cases_fail, headers=headers_lender)
    if fail_resp.status_code in [400, 403]:
        print("SUCCESS: Lender was blocked from assigning worker.")
    else:
        print(f"FAILURE: Lender was allowed? Code: {fail_resp.status_code}")

    # Test 2: Lender creating normally
    print("Creating case normally as Lender...")
    create_resp = requests.post(f"{BASE_URL}/cases/", json=case_data, headers=headers_lender)
    if create_resp.status_code == 200:
        case_id = create_resp.json()['id']
        print(f"SUCCESS: Case created! ID: {case_id}")
    else:
        print(f"Failed to create case: {create_resp.text}")
        return

    # 3. Admin Assigns Worker
    print("\n--- Testing Admin Assignment ---")
    print(f"Assigning Worker {worker_id} to Case {case_id}...")
    assign_resp = requests.put(f"{BASE_URL}/cases/{case_id}/status", json={"assigned_worker_id": worker_id}, headers=headers_admin)
    if assign_resp.status_code == 200:
        print("SUCCESS: Admin assigned worker.")
    else:
        print(f"Failed assignment: {assign_resp.text}")

    # 4. Worker manages alerts
    print("\n--- Testing Worker Alert Control ---")
    alert_data = {
        "title": "Visit Required",
        "message": "Visit borrower for verification",
        "severity": "WARNING",
        "target_user_email": admin_email
    }
    print("Worker creating alert...")
    alert_resp = requests.post(f"{BASE_URL}/alerts/", json=alert_data, headers=headers_worker)
    if alert_resp.status_code == 200:
        alert_id = alert_resp.json()['id']
        print(f"SUCCESS: Worker created alert {alert_id}")
        
        print("Worker stopping alert...")
        stop_resp = requests.put(f"{BASE_URL}/alerts/{alert_id}/stop", headers=headers_worker)
        if stop_resp.status_code == 200:
            print("SUCCESS: Worker stopped alert.")
        else:
            print(f"Failed stop: {stop_resp.text}")
    else:
        print(f"Failed alert creation: {alert_resp.text}")

if __name__ == "__main__":
    main()
