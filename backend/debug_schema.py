try:
    from app.schemas.user import UserUpdate
    print("DEBUG: Imported UserUpdate")
except Exception as e:
    print(f"DEBUG: Error: {e}")
    import traceback
    traceback.print_exc()
