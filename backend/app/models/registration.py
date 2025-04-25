from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class RegistrationBase(BaseModel):
    workshop_id: str
    user_id: Optional[str] = None
    email: str
    full_name: str
    grade: int
    school: str
    phone: str
    parent_name: str
    parent_phone: str
    payment_status: str = "pending"  # pending, completed, failed
    registration_status: str = "pending"  # pending, approved, rejected

class RegistrationCreate(RegistrationBase):
    pass

class RegistrationUpdate(BaseModel):
    payment_status: Optional[str] = None
    registration_status: Optional[str] = None
    payment_id: Optional[str] = None
    notes: Optional[str] = None

class Registration(RegistrationBase):
    id: str = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    payment_id: Optional[str] = None
    amount_paid: Optional[float] = None
    notes: Optional[str] = None
    
    class Config:
        populate_by_name = True

class RegistrationInDB(Registration):
    pass