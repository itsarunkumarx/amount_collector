import requests
import sys

BASE_URL = "http://localhost:8080/api/v1"
ADMIN_EMAIL = "arunkumarpalani428@gmail.com"
ADMIN_PASS = "Arunkumar@2006"

def run_test():
    session = requests.Session()
    
    # 1. Login
    print("Logging in...")
    login_res = session.post(f"{BASE_URL}/auth/login", data={
        "username": ADMIN_EMAIL,
        "password": ADMIN_PASS
    })
    
    if login_res.status_code != 200:
        print(f"Login Failed: {login_res.text}")
        sys.exit(1)
        
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login success.")
    
    # 2. Create Worker
    print("Creating worker...")
    worker_data = {
        "email": "temp_delete_test@example.com",
        "password": "password123",
        "full_name": "Delete Test Worker",
        "phone_number": "1234567890",
        "role": "TEAM_WORKER"
    }
    create_res = session.post(f"{BASE_URL}/auth/register", json=worker_data, headers=headers) # Register endpoint usually public but maybe restricted?
    # Actually register endpoint in auth.py is usually public. 
    # But usually creating a worker is done via a specific endpoint if it needs admin approval?
    # WorkerManagementPage uses /auth/register?
    # Checking lines 59 in WorkerManagementPage.jsx: await api.post('/auth/register', { ... }); 
    
    if create_res.status_code not in [200, 201]:
         # It might fail if already exists, try to get it
         print(f"Create failed (might exist): {create_res.text}")
    else:
        print("Worker created.")

    # 3. List Workers
    print("Listing workers...")
    list_res = session.get(f"{BASE_URL}/users/workers", headers=headers)
    if list_res.status_code != 200:
        print(f"List workers failed: {list_res.text}")
        sys.exit(1)
        
    workers = list_res.json()
    target_worker = next((w for w in workers if w["email"] == worker_data["email"]), None)
    
    if not target_worker:
        print("Target worker not found in list!")
        sys.exit(1)
        
    print(f"Found worker ID: {target_worker['id']}")
    
    # 4. Delete Worker
    print(f"Deleting worker {target_worker['id']}...")
    delete_res = session.delete(f"{BASE_URL}/users/{target_worker['id']}", headers=headers)
    
    if delete_res.status_code not in [200, 204]:
        print(f"Delete failed: {delete_res.status_code} {delete_res.text}")
        sys.exit(1)
        
    print("Delete request successful.")
    
    # 5. Verify Deletion
    print("Listing workers again...")
    list_res_2 = session.get(f"{BASE_URL}/users/workers", headers=headers)
    workers_2 = list_res_2.json()
    
    still_exists = any(w["id"] == target_worker['id'] for w in workers_2)
    
    if still_exists:
        print("FAILURE: Worker still exists in list after delete!")
    else:
        print("SUCCESS: Worker removed from list.")

if __name__ == "__main__":
    run_test()
