from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models import Lead, LeadStatus
from app.schemas import LeadCreate


def create_lead(db: Session, lead_in: LeadCreate) -> Lead:
    lead = Lead(name=lead_in.name, email=lead_in.email, phone=lead_in.phone)
    db.add(lead)
    db.commit()
    db.refresh(lead)
    return lead


def get_lead(db: Session, lead_id: str) -> Lead | None:
    return db.get(Lead, lead_id)


def update_lead_status(db: Session, lead: Lead, status: LeadStatus) -> Lead:
    lead.status = status
    db.commit()
    db.refresh(lead)
    return lead


def list_leads(
    db: Session,
    *,
    search: str | None = None,
    status: LeadStatus | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Lead]:
    """
    List leads, newest first, optionally filtered by a free-text search
    (matches name, email or phone) and/or an exact status.
    """
    query = db.query(Lead)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Lead.name.ilike(pattern),
                Lead.email.ilike(pattern),
                Lead.phone.ilike(pattern),
            )
        )

    if status is not None:
        query = query.filter(Lead.status == status)

    return (
        query.order_by(Lead.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
