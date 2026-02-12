import asyncio
import requests

# Config
BASE_URL = "http://localhost:8080/api/v1"
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "admin"

def login_admin():
    response = requests.post(f"{BASE_URL}/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if response.status_code == 200:
        print("Login successful.")
        return response.json()["access_token"]
    print(f"Login failed: {response.text}")
    return None

def test_workflow():
    token = login_admin()
    if not token:
        return

    headers = {"Authorization": f"Bearer {token}"}

    # 1. Create Worker
    print("\n1. Creating Worker...")
    worker_data = {
        "email": "temp_worker@example.com",
        "password": "password123",
        "full_name": "Temporary Worker",
        "phone_number": "1234567890",
        "role": "TEAM_WORKER"
    }
    res = requests.post(f"{BASE_URL}/auth/register", json=worker_data, headers=headers)
    if res.status_code not in [200, 201]:
        print(f"Create failed: {res.text}")
        return
    worker_id = res.json()["id"]
    print(f"Worker created with ID: {worker_id}")

    # 2. Update Worker
    print("\n2. Updating Worker...")
    update_data = {
        "full_name": "Updated Worker Name"
    }
    res = requests.put(f"{BASE_URL}/users/{worker_id}", json=update_data, headers=headers)
    if res.status_code == 200:
        print("Update successful.")
        if res.json()["full_name"] == "Updated Worker Name":
            print("Name verified.")
        else:
            print("Name mismatch.")
    else:
        print(f"Update failed: {res.text}")

    # 3. Delete Worker
    print("\n3. Deleting Worker...")
    res = requests.delete(f"{BASE_URL}/users/{worker_id}", headers=headers)
    if res.status_code == 204:
        print("Delete successful.")
    else:
        print(f"Delete failed: {res.text}")

    # 4. Verify Deletion
    res = requests.get(f"{BASE_URL}/users/workers", headers=headers)
    workers = res.json()
    found = any(w['id'] == worker_id for w in workers)
    if not found:
        print("Deletion verified (Worker not found in list).")
    else:
        print("Deletion failed (Worker still in list).")

if __name__ == "__main__":
    test_workflow()
