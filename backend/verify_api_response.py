import requests
import sys

BASE_URL = "http://localhost:8080/api/v1"
EMAIL = "lender_api_test@example.com"
PASSWORD = "password123"

def run():
    # 1. Register/Login
    print(f"Logging in as {EMAIL}...")
    # Try login first
    resp = requests.post(f"{BASE_URL}/auth/login", data={"username": EMAIL, "password": PASSWORD})
    
    if resp.status_code != 200:
        print("Login failed, attempting register...")
        # Register if not exists
        resp = requests.post(f"{BASE_URL}/auth/register", json={
            "email": EMAIL,
            "password": PASSWORD,
            "full_name": "API Tester",
            "role": "VERIFIED_USER",
            "phone_number": "5550001"
        })
        if resp.status_code not in [200, 201]:
            print(f"Registration failed: {resp.text}")
            return
        # Login again
        resp = requests.post(f"{BASE_URL}/auth/login", data={"username": EMAIL, "password": PASSWORD})
        if resp.status_code != 200:
            print(f"Login after register failed: {resp.text}")
            return

    token = resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login success.")

    # 2. Create Case
    print("Creating case...")
    case_data = {
        "borrower_name": "API Borrower",
        "borrower_email": "api@borrower.com",
        "borrower_phone": "999888777",
        "amount_lent": 5000,
        "amount_pending": 5000,
        "interest_rate": 5,
        "due_date": None
    }
    resp = requests.post(f"{BASE_URL}/cases/", json=case_data, headers=headers)
    if resp.status_code not in [200, 201]:
        print(f"Create case failed: {resp.text}")
    else:
        print("Case created successfully.")

    # 3. Fetch Cases
    print("Fetching cases...")
    resp = requests.get(f"{BASE_URL}/cases/", headers=headers)
    if resp.status_code != 200:
        print(f"Fetch cases failed: {resp.text}")
        return
    
    cases = resp.json()
    print(f"API Returned {len(cases)} cases.")
    print(cases)

if __name__ == "__main__":
    run()
