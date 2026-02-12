from app.core.config import settings
print(f"CORS Origins: {[str(o) for o in settings.BACKEND_CORS_ORIGINS]}")
