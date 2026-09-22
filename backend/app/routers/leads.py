from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app import crud
from app.database import get_db
from app.models import LeadStatus
from app.schemas import LeadCreate, LeadOut, LeadStatusUpdate

router = APIRouter(prefix="/api/leads", tags=["leads"])


@router.post("", response_model=LeadOut, status_code=201)
def create_lead(lead_in: LeadCreate, db: Session = Depends(get_db)):
    return crud.create_lead(db, lead_in)


@router.get("", response_model=list[LeadOut])
def list_leads(
    search: str | None = Query(
        None, description="Free-text search across name, email and phone"
    ),
    status: LeadStatus | None = Query(None, description="Filter by exact status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    return crud.list_leads(db, search=search, status=status, skip=skip, limit=limit)


@router.patch("/{lead_id}/status", response_model=LeadOut)
def update_lead_status(
    lead_id: str, payload: LeadStatusUpdate, db: Session = Depends(get_db)
):
    lead = crud.get_lead(db, lead_id)
    if lead is None:
        raise HTTPException(status_code=404, detail="Lead not found")
    return crud.update_lead_status(db, lead, payload.status)
