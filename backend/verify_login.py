import requests
import sys

BASE_URL = "http://127.0.0.1:8080/api/v1"

users = [
    {"email": "arunkumarpalani428@gmail.com", "password": "Arunkumar@2006", "role": "ADMIN"},
    {"email": "teamworker@antigravity.com", "password": "worker123", "role": "TEAM_WORKER"},
    {"email": "user@antigravity.com", "password": "user123", "role": "USER"},
]

def verify_login():
    print(f"Testing Login against {BASE_URL}...")
    success_count = 0
    
    for user in users:
        try:
            response = requests.post(f"{BASE_URL}/auth/login", data={
                "username": user["email"],
                "password": user["password"]
            })
            
            if response.status_code == 200:
                data = response.json()
                print(f"DEBUG RESPONSE: {data}") # NEW DEBUG LINE
                returned_role = data.get("role")
                if returned_role == user["role"]:
                    print(f"[SUCCESS] Login successful for {user['email']} (Role: {returned_role})")
                    success_count += 1
                else:
                    print(f"[FAILURE] Role mismatch for {user['email']}. Expected {user['role']}, got {returned_role}")
            else:
                print(f"[FAILURE] Login failed for {user['email']}. Status: {response.status_code}, Response: {response.text}")
        except Exception as e:
            print(f"[ERROR] Could not connect for {user['email']}: {e}")

    if success_count == len(users):
        print("\nALL LOGIN TESTS PASSED!")
    else:
        print("\nSOME TESTS FAILED.")
        sys.exit(1)

if __name__ == "__main__":
    verify_login()
