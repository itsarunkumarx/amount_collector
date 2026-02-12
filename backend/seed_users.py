import asyncio
from app.core.database import init_db
from app.models.user import User
from app.core import security
from app.core.user_roles import UserRole

async def seed_users():
    await init_db()
    
    users = [
        {
            "email": "arunkumarpalani428@gmail.com",
            "password": "Arunkumar@2006",
            "full_name": "Arunkumar Admin",
            "role": UserRole.ADMIN
        },
        {
            "email": "teamworker@antigravity.com",
            "password": "worker123",
            "full_name": "Antigravity Worker",
            "role": UserRole.TEAM_WORKER
        },
        {
            "email": "user@antigravity.com",
            "password": "user123",
            "full_name": "Normal User",
            "role": UserRole.USER
        }
    ]

    for u in users:
        existing = await User.find_one(User.email == u["email"])
        if existing:
            print(f"User {u['email']} already exists. Updating role and password...")
            existing.role = u["role"]
            existing.hashed_password = security.get_password_hash(u["password"])
            await existing.save()
            print(f"Updated {u['email']}")
        else:
            new_user = User(
                email=u["email"],
                hashed_password=security.get_password_hash(u["password"]),
                full_name=u["full_name"],
                role=u["role"],
                is_active=True,
                is_verified=True
            )
            await new_user.create()
            print(f"Created {u['email']} as {u['role']}")

if __name__ == "__main__":
    asyncio.run(seed_users())
