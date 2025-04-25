from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional

class TestimonialBase(BaseModel):
    name: str
    content: str
    role: str  # student, teacher, parent
    is_visible: bool = True

class TestimonialCreate(TestimonialBase):
    pass

class TestimonialUpdate(BaseModel):
    name: Optional[str] = None
    content: Optional[str] = None
    role: Optional[str] = None
    is_visible: Optional[bool] = None

class Testimonial(TestimonialBase):
    id: str = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class TestimonialInDB(Testimonial):
    pass