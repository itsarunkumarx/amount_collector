import asyncio
from app.core.database import init_db
from app.models.user import User

async def test_delete():
    await init_db()
    
    # Create a dummy user
    dummy_email = "to_be_deleted@example.com"
    dummy = await User.find_one(User.email == dummy_email)
    if not dummy:
        dummy = User(
            email=dummy_email,
            hashed_password="fake",
            full_name="Delete Me",
            role="TEAM_WORKER"
        )
        await dummy.create()
        print(f"Created dummy user: {dummy.id}")
    else:
        print(f"Found existing dummy user: {dummy.id}")
        
    # Verify existence
    exists = await User.get(dummy.id)
    print(f"User exists before delete: {exists is not None}")
    
    # Perform delete
    await dummy.delete()
    print("Called delete()")
    
    # Verify removal
    gone = await User.get(dummy.id)
    print(f"User exists after delete: {gone is not None}")
    
    if gone is None:
        print("SUCCESS: User was deleted.")
    else:
        print("FAILURE: User still exists.")

if __name__ == "__main__":
    asyncio.run(test_delete())
