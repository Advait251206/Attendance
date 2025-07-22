from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Date, Enum as PyEnum
from sqlalchemy.orm import relationship
from .database import Base
import enum

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False) # <-- NEW
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    attendance_records = relationship("Attendance", back_populates="owner")
    subjects = relationship("Subject", back_populates="owner")

class Subject(Base):
    __tablename__ = "subjects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    professor = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="subjects")

class AttendanceStatus(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"
    CANCELLED = "cancelled"
    EXCHANGED = "exchanged"

class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(PyEnum(AttendanceStatus), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    owner_id = Column(Integer, ForeignKey("users.id"))
    note = Column(String, nullable=True)

    owner = relationship("User", back_populates="attendance_records")
    subject = relationship("Subject")