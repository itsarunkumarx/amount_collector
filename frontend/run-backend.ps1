Write-Host "Starting Backend Server..." -ForegroundColor Gold
Set-Location -Path .\backend
& ..\.venv\Scripts\python -m uvicorn main:app --reload --port 8000
