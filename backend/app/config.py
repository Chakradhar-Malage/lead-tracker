"""
Application configuration.

Reads settings from environment variables (and a local .env file during
development). Keeping this in one place means the rest of the app never
touches `os.environ` directly.
"""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Default falls back to a local Postgres instance for local dev.
    # In production (Render) this is overridden by the DATABASE_URL env var.
    database_url: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/lead_tracker"

    # Comma-separated list of allowed CORS origins. In production this should
    # be set to the deployed frontend URL(s).
    cors_origins: str = "http://localhost:5173,http://localhost:3000,https://lead-tracker-assignment.onrender.com"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
