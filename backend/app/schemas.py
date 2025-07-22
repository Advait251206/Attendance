import re
from pydantic import BaseModel, ConfigDict, Field, validator, EmailStr
from typing import List, Optional
from datetime import date
from .models import AttendanceStatus

# --- Subject Schemas ---
class SubjectBase(BaseModel):
    name: str
    professor: Optional[str] = None

class SubjectCreate(SubjectBase):
    pass

class Subject(SubjectBase):
    id: int
    owner_id: int
    model_config = ConfigDict(from_attributes=True) # CORRECTED

# --- Attendance Schemas ---
class AttendanceBase(BaseModel):
    date: date
    status: AttendanceStatus
    note: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    subject_id: int

class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    note: Optional[str] = None
    subject_id: Optional[int] = None

class Attendance(AttendanceBase):
    id: int
    subject: Subject # Nesting the subject schema for richer responses
    model_config = ConfigDict(from_attributes=True) # CORRECTED

class UserBase(BaseModel):
    username: str
    email: EmailStr # <-- NEW

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    @validator('password')
    def strong_password(cls, v):
        """
        A strong password must contain at least one uppercase letter,
        one lowercase letter, one number, and one special character.
        """
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[a-z]', v):
            raise ValueError('Password must contain at least one lowercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        if not re.search(r'[@$!%*?&#]', v):
            raise ValueError('Password must contain at least one special character (@$!%*?&#)')
        return v

class User(UserBase):
    id: int
    is_active: bool
    subjects: List[Subject] = []
    model_config = ConfigDict(from_attributes=True)

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# --- Dashboard Schemas ---
class StatsSummary(BaseModel):
    total_classes: int
    present_count: int
    absent_count: int
    cancelled_count: int
    overall_percentage: float