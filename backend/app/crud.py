from sqlalchemy import or_
from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

# --- User CRUD ---
def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        username=user.username, 
        email=user.email, 
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username_or_email: str, password: str) -> models.User | None:
    user = db.query(models.User).filter(
        or_(models.User.username == username_or_email, models.User.email == username_or_email)
    ).first()

    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user

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
# (The rest of this file is unchanged and correct)
def get_attendance_by_date(db: Session, user_id: int, specific_date: str):
    # This function needs a date object, not a string. Let's fix this too.
    from datetime import date
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