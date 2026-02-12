from typing import Any
import shutil
import os
from pathlib import Path
from fastapi import APIRouter, File, UploadFile, HTTPException
from app.api import deps
from app.core.config import settings

router = APIRouter()

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

@router.post("/upload", response_model=dict)
async def upload_file(
    file: UploadFile = File(...)
) -> Any:
    """
    Upload a file and get the URL.
    """
    try:
        # Create unique filename or keep original? For simplicity, keep original but handle overwrite/collision if needed.
        # Ideally use UUID.
        file_path = UPLOAD_DIR / file.filename
        
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return URL (assuming served at /static/filename or /uploads/filename)
        # We need to mount static dir in main.py
        url = f"/uploads/{file.filename}" 
        return {"url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
