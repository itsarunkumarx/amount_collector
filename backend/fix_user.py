import asyncio
import httpx

API_URL = "http://127.0.0.1:8080/api/v1"
ADMIN_EMAIL = "arunkumarpalani428@gmail.com"
ADMIN_PASS = "Arunkumar@2006"
USER_EMAIL = "user@antigravity.com"

async def fix():
    async with httpx.AsyncClient() as client:
        # Login Admin
        res = await client.post(f"{API_URL}/auth/login", data={"username": ADMIN_EMAIL, "password": ADMIN_PASS})
        token = res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get Users
        users_res = await client.get(f"{API_URL}/users/", headers=headers)
        users = users_res.json()
        target = next((u for u in users if u['email'] == USER_EMAIL), None)
        
        if target:
            print(f"Found User: {target['full_name']} (Role: {target['role']}, Verified: {target['is_verified']})")
            if target['role'] != 'VERIFIED_USER':
                print("Upgrading user...")
                up_res = await client.put(f"{API_URL}/users/{target['id']}/verify", headers=headers)
                print(f"Upgrade Result: {up_res.status_code}")
                print(f"New Body: {up_res.text}")
            else:
                print("User is already VERIFIED_USER")
        else:
            print("User NOT found")

if __name__ == "__main__":
    asyncio.run(fix())
