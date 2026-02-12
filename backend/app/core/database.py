from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.case import MoneyCase
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.models.audit import AuditLog

client = None

async def init_db():
    global client
    try:
        client = AsyncIOMotorClient(settings.MONGODB_URL)
        
        # Beanie initialization
        await init_beanie(
            database=client[settings.DATABASE_NAME],
            document_models=[
                User,
                MoneyCase,
                Transaction,
                Alert,
                AuditLog
            ]
        )
        print("✓ MongoDB connection successful")
    except Exception as e:
        print(f"⚠ MongoDB connection failed (will retry): {str(e)}")
        # Continue anyway - may connect later
