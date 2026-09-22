import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Enum as SAEnum
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class LeadStatus(str, enum.Enum):
    NEW = "NEW"
    CONTACTED = "CONTACTED"
    QUALIFIED = "QUALIFIED"
    CONVERTED = "CONVERTED"
    LOST = "LOST"


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(50), nullable=False)
    status: Mapped[LeadStatus] = mapped_column(
        SAEnum(LeadStatus, name="lead_status"), nullable=False, default=LeadStatus.NEW
    )
    created_at: Mapped[datetime] = mapped_column(default=_utcnow, nullable=False)
