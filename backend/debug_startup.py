import sys
import os

# Add the current directory to sys.path
sys.path.append(os.getcwd())

print("DEBUG: Starting imports...")
try:
    from app.core.config import settings
    print("DEBUG: Imported settings")
    from app.core.security import create_access_token
    print("DEBUG: Imported security")
    from app.models.user import User
    print("DEBUG: Imported User model")
    from app.core.database import init_db
    print("DEBUG: Imported init_db")
    from main import app
    print("DEBUG: Imported app")
except Exception as e:
    print(f"DEBUG: Import failed: {e}")
    import traceback
    traceback.print_exc()
