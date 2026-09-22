from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import leads

settings = get_settings()

# Creates tables if they don't exist yet. For a production-grade workflow
# migrations are managed via Alembic (see backend/alembic/), but this keeps
# local/dev startup simple and idempotent.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lead Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(leads.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
