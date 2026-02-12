import asyncio
from app.core.database import init_db
from app.models.user import User

async def main():
    await init_db()
    
    users = await User.find(User.email == "arunkumarpalani74@gmail.com").to_list() # From login screenshot
    if not users:
         users = await User.find(User.email == "arunkumarpalani428@gmail.com").to_list() # From admin login
    
    for u in users:
        print(f"User: {u.full_name} ({u.email}) - Role: {u.role}")

if __name__ == "__main__":
    loop = asyncio.get_event_loop()
    loop.run_until_complete(main())
