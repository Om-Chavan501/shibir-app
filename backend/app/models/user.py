from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    is_active: bool = True
    role: str = "user"  # user, admin, organizer

class UserCreate(UserBase):
    password: str
    grade: Optional[int] = None
    school: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    grade: Optional[int] = None
    school: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    
class UserInDB(UserBase):
    id: str = Field(default=None, alias="_id")
    password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    grade: Optional[int] = None
    school: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "email": "student@example.com",
                "full_name": "Student Name",
                "password": "hashed_password",
                "role": "user",
                "is_active": True,
                "grade": 9,
                "school": "Example High School"
            }
        }

class User(UserBase):
    id: str = Field(default=None, alias="_id")
    created_at: datetime
    grade: Optional[int] = None
    school: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None

    class Config:
        populate_by_name = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginCredentials(BaseModel):
    email: EmailStr
    password: str