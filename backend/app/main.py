"""Entry point for the VulnTrack Pro backend.

This module creates and configures the FastAPI application, including
router registration, CORS setup and database initialisation. When the
application starts the database tables are created (if they do not
already exist) and demo data is seeded.
"""

from __future__ import annotations

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import init_db
from .routers import auth, reports, dashboard
from .seed import seed_demo_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables and seed demo data when the API process starts."""
    init_db()
    seed_demo_data()
    yield


def get_cors_origins() -> list[str]:
    """Return explicit allowed frontend origins for local and deployed clients."""
    raw_origins = os.getenv("CORS_ORIGINS") or os.getenv("CORS_ORIGIN") or "http://localhost:5173"
    return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]


app = FastAPI(title="VulnTrack Pro API", debug=False, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health_check() -> dict:
    """Simple health check endpoint."""
    return {"status": "ok"}
