from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import leads

settings = get_settings()

# Schema is managed by Alembic migrations (see backend/alembic/), which are
# run explicitly as a deploy step (see render.yaml). The app itself does not
# create or alter tables at startup, so schema changes always go through a
# reviewable migration.

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
