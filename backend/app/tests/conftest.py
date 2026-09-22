import os

# The app creates tables against `settings.database_url` at import time
# (see app/main.py). Point that at a throwaway local SQLite file *before*
# importing the app, so test collection never tries to open a real Postgres
# connection. Each individual test still gets its own isolated in-memory
# DB via the `client` fixture below.
os.environ.setdefault("DATABASE_URL", "sqlite:///./test_main_module.db")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app


@pytest.fixture()
def client():
    """
    Spins up a fresh in-memory SQLite database for each test, and points
    the FastAPI app's `get_db` dependency at it instead of the real
    (Postgres) database. This keeps tests fast, isolated and free of any
    external dependency.
    """
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
