@echo off
echo Starting Backend Server...
cd backend
..\.venv\Scripts\python -m uvicorn main:app --reload --port 8000
