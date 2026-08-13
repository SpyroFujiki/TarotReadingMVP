from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.api.auth import router as auth_router
from app.api.packages import router as packages_router
from app.api.booking import router as bookings_router
from app.api.service_message import router as service_message_router
from app.api.dispute import router as dispute_router
from app.api.admin import router as admin_router
from app.api.dispute_message import router as dispute_message_router

from app.db.session import engine


app = FastAPI(
    title="Tarot Reading API",
    version="0.1.0",
)

app.include_router(packages_router)
app.include_router(bookings_router)
app.include_router(service_message_router)
app.include_router(dispute_router)
app.include_router(admin_router)
app.include_router(dispute_message_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health")
def health_check():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {
        "status": "ok",
        "database": "connected",
    }