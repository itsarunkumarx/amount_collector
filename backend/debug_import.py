import sys
import os

print("DEBUG: Start")
try:
    print("DEBUG: Importing config...")
    from app.core.config import settings
    print(f"DEBUG: Config imported. DB URL: {settings.MONGODB_URL}")

    print("DEBUG: Importing security...")
    from app.core.security import create_access_token
    print("DEBUG: Security imported.")
    
    print("DEBUG: Importing main...")
    from main import app
    print("DEBUG: Main imported.")
except Exception as e:
    print(f"DEBUG: Error: {e}")
    import traceback
    traceback.print_exc()
