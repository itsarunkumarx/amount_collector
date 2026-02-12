import asyncio
from app.core.database import init_db
from app.models.user import User

async def check_user():
    await init_db()
    email = "arunkumarpalani428@gmail.com"
    user = await User.find_one(User.email == email)
    if user:
        print(f"User found: {user.email}, Role: {user.role}, Active: {user.is_active}")
    else:
        print(f"User {email} NOT FOUND in database.")

if __name__ == "__main__":
    asyncio.run(check_user())
