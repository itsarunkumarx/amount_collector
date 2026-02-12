try:
    from app.api import deps
    print("DEBUG: Imported deps")
    from fastapi import Depends
    print("DEBUG: Imported Depends")
    d1 = Depends(deps.get_current_active_user)
    print("DEBUG: Created get_current_active_user dependency")
    d2 = Depends(deps.get_current_active_superuser)
    print("DEBUG: Created get_current_active_superuser dependency")
except Exception as e:
    print(f"DEBUG: Error: {e}")
    import traceback
    traceback.print_exc()
