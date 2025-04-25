from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List

class WorkshopBase(BaseModel):
    title: str
    description: str
    short_description: str
    image_url: str
    start_date: datetime
    end_date: datetime
    registration_deadline: datetime
    location: str
    max_participants: int
    fee: float
    eligible_grades: List[int]
    featured: bool = False
    status: str = "upcoming"  # upcoming, ongoing, completed, cancelled

class WorkshopCreate(WorkshopBase):
    pass

class WorkshopUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    registration_deadline: Optional[datetime] = None
    location: Optional[str] = None
    max_participants: Optional[int] = None
    fee: Optional[float] = None
    eligible_grades: Optional[List[int]] = None
    featured: Optional[bool] = None
    status: Optional[str] = None

class Workshop(WorkshopBase):
    id: str = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    registered_count: int = 0

    class Config:
        populate_by_name = True

class WorkshopInDB(Workshop):
    pass