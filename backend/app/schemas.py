from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, field_validator

from app.models import LeadStatus


class LeadCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("name must not be blank")
        return v

    @field_validator("phone")
    @classmethod
    def phone_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("phone must not be blank")
        return v


class LeadStatusUpdate(BaseModel):
    status: LeadStatus


class LeadOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str
    status: LeadStatus
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
