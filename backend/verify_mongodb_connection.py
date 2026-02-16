import asyncio
import os
import sys
import certifi

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

async def test_connection():
    print(f"Connecting to: {settings.MONGODB_URL}")
    try:
        client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            tlsCAFile=certifi.where()
        )
        await client.admin.command('ping')
        print("Success: Successfully connected to MongoDB")
        db = client[settings.DATABASE_NAME]
        print(f"Using database: {settings.DATABASE_NAME}")
    except Exception as e:
        print(f"Error: Failed to connect to MongoDB: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
