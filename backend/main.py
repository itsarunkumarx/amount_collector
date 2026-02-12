from contextlib import asynccontextmanager
import asyncio
import httpx
import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.api.v1.api import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    print("Database initialized")
    
    # Keep-alive background task
    app.state.keep_alive_task = asyncio.create_task(keep_alive_ping())
    
    yield
    # Shutdown
    if hasattr(app.state, "keep_alive_task"):
        app.state.keep_alive_task.cancel()
    print("Shutting down")

async def keep_alive_ping():
    """Background task to ping the server itself to prevent sleeping on Render"""
    await asyncio.sleep(60) # Initial delay
    url = os.getenv("RENDER_EXTERNAL_URL") or "http://127.0.0.1:8000"
    health_url = f"{url.rstrip('/')}/health"
    
    async with httpx.AsyncClient() as client:
        while True:
            try:
                print(f"Keep-alive: Pinging {health_url}")
                response = await client.get(health_url)
                print(f"Keep-alive status: {response.status_code}")
            except Exception as e:
                print(f"Keep-alive error: {e}")
            
            # Ping every 14 minutes (Render sleeps after 15 mins of inactivity)
            await asyncio.sleep(14 * 60)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-powered amount collection and alert platform",
    version="1.0.0",
    lifespan=lifespan
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(api_router, prefix=settings.API_V1_STR)



@app.get("/")
def root():
    return {"message": "Royal Amount Collector Backend Running 🚀", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
