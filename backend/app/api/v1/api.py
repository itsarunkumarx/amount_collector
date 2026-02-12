from fastapi import APIRouter
from app.api.v1.endpoints import auth, users
from app.api.v1.endpoints import auth, users, cases, transactions, alerts, reports, utils

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(transactions.router, prefix="/transactions", tags=["transactions"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
