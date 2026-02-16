from motor.motor_asyncio import AsyncIOMotorClient
import certifi
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
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tlsCAFile=certifi.where()
        )
        
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
        print("Success: MongoDB connection successful")
    except Exception as e:
        print(f"Error: MongoDB connection failed: {str(e)}")
        # Raise the error if it's a startup failure
        raise e
