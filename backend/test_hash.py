from app.core import security

try:
    hash = security.get_password_hash("testpassword")
    print(f"Hash success: {hash}")
except Exception as e:
    print(f"Hash failed: {e}")
