from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from .. import crud, models, schemas
from ..database import get_db
from ..security import get_current_active_user # <-- CORRECTED IMPORT

router = APIRouter(prefix="/api", tags=["Attendance System"]) # Added /api prefix for clarity


# --- Subjects Endpoints ---
@router.post("/subjects/", response_model=schemas.Subject, status_code=status.HTTP_201_CREATED)
def create_subject_for_user(
    subject: schemas.SubjectCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.create_user_subject(db=db, subject=subject, user_id=current_user.id)


@router.get("/subjects/", response_model=List[schemas.Subject])
def read_subjects(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_subjects_by_user(db=db, user_id=current_user.id)


# --- Attendance Endpoints ---
@router.post("/attendance/", response_model=schemas.Attendance, status_code=status.HTTP_201_CREATED)
def create_attendance(
    attendance: schemas.AttendanceCreate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify the subject belongs to the current user before logging attendance
    subject = crud.get_subject(db, subject_id=attendance.subject_id, user_id=current_user.id)
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found or does not belong to user")
    return crud.create_attendance_record(db=db, attendance=attendance, user_id=current_user.id)


@router.get("/attendance/{specific_date}", response_model=List[schemas.Attendance])
def get_attendance_for_date(
    specific_date: date,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return crud.get_attendance_by_date(db, user_id=current_user.id, specific_date=specific_date)


@router.put("/attendance/{attendance_id}", response_model=schemas.Attendance)
def update_attendance(
    attendance_id: int,
    attendance_update: schemas.AttendanceUpdate,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    record = crud.update_attendance_record(db, attendance_id, attendance_update, current_user.id)
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return record


@router.delete("/attendance/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(
    attendance_id: int,
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    if not crud.delete_attendance_record(db, attendance_id, current_user.id):
        raise HTTPException(status_code=404, detail="Attendance record not found")
    return {"detail": "Record deleted successfully"} # FastAPI returns 204 so this won't be sent


# --- Dashboard/Stats Endpoint ---
@router.get("/stats/summary", response_model=schemas.StatsSummary)
def get_stats_summary(
    current_user: models.User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # This logic can be moved to crud.py for better organization
    records = db.query(models.Attendance).filter(models.Attendance.owner_id == current_user.id).all()
    
    # Exclude cancelled and exchanged classes from percentage calculation
    valid_records = [r for r in records if r.status in (models.AttendanceStatus.PRESENT, models.AttendanceStatus.ABSENT)]
    total_classes = len(valid_records)
    
    present_count = len([r for r in valid_records if r.status == models.AttendanceStatus.PRESENT])
    absent_count = len([r for r in valid_records if r.status == models.AttendanceStatus.ABSENT])
    cancelled_count = len([r for r in records if r.status == models.AttendanceStatus.CANCELLED])

    overall_percentage = (present_count / total_classes * 100) if total_classes > 0 else 0

    return schemas.StatsSummary(
        total_classes=total_classes,
        present_count=present_count,
        absent_count=absent_count,
        cancelled_count=cancelled_count,
        overall_percentage=round(overall_percentage, 2)
    )