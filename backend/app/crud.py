# backend/app/crud.py

from sqlalchemy import or_
from sqlalchemy.orm import Session
from . import models, schemas

# --- User CRUD ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(
        username=user.username,
        email=user.email,
        password=user.password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username_or_email: str, password: str):
    """
    Authenticates a user and returns a specific reason for failure.
    Returns: A tuple of (user_object, error_message_string).
             On success, error_message_string will be None.
             On failure, user_object will be None.
    """
    user = db.query(models.User).filter(
        or_(models.User.username == username_or_email, models.User.email == username_or_email)
    ).first()

    # Case 1: The user does not exist in the database.
    if not user:
        return None, "Username or email does not exist"
    
    # Case 2: The user exists, but the password is incorrect.
    if user.password != password:
        return None, "Password is incorrect"
        
    # Case 3: Success. User exists and password is correct.
    return user, None

# --- Subject CRUD ---
def get_subject(db: Session, subject_id: int, user_id: int):
    return db.query(models.Subject).filter(models.Subject.id == subject_id, models.Subject.owner_id == user_id).first()

def get_subjects_by_user(db: Session, user_id: int):
    return db.query(models.Subject).filter(models.Subject.owner_id == user_id).all()

def create_user_subject(db: Session, subject: schemas.SubjectCreate, user_id: int):
    db_subject = models.Subject(**subject.model_dump(), owner_id=user_id)
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

# --- Attendance CRUD ---
def get_attendance_by_date(db: Session, user_id: int, specific_date: str):
    return db.query(models.Attendance).filter(models.Attendance.owner_id == user_id, models.Attendance.date == specific_date).all()

def create_attendance_record(db: Session, attendance: schemas.AttendanceCreate, user_id: int):
    db_attendance = models.Attendance(**attendance.model_dump(), owner_id=user_id)
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def update_attendance_record(db: Session, attendance_id: int, attendance_update: schemas.AttendanceUpdate, user_id: int):
    db_attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id, models.Attendance.owner_id == user_id).first()
    if not db_attendance:
        return None
    
    update_data = attendance_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_attendance, key, value)
        
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    return db_attendance

def delete_attendance_record(db: Session, attendance_id: int, user_id: int):
    db_attendance = db.query(models.Attendance).filter(models.Attendance.id == attendance_id, models.Attendance.owner_id == user_id).first()
    if db_attendance:
        db.delete(db_attendance)
        db.commit()
        return True
    return False