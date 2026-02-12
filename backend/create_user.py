import asyncio
from app.core.database import init_db
from app.models.user import User
from app.core import security
from app.core.user_roles import UserRole

async def create_user():
    await init_db()
    email = "arunkumarpalani428@gmail.com"
    password = "Arunkumar@2006"
    
    # Check if exists again just in case
    existing_user = await User.find_one(User.email == email)
    if existing_user:
        print(f"User {email} already exists.")
        return

    hashed_password = security.get_password_hash(password)
    new_user = User(
        email=email,
        hashed_password=hashed_password,
        full_name="Arunkumar Palani",
        role=UserRole.ADMIN, # Making admin for full access
        is_active=True,
        is_verified=True,
        phone_number="1234567890"
    )
    await new_user.create()
    print(f"Successfully created user: {email} with password: {password}")

if __name__ == "__main__":
    asyncio.run(create_user())
