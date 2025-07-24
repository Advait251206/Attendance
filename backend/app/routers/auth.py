from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from sqlalchemy.exc import IntegrityError # Import the specific database exception

from .. import crud, models, schemas
from ..database import get_db
from ..security import create_access_token, get_current_active_user, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Handles new user registration with specific error handling."""
    
    # --- CHECKS ARE NOW OUTSIDE THE TRY BLOCK ---
    # This allows their specific HTTPException to be sent directly to the user.
    if crud.get_user_by_username(db, username=user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # --- THE TRY BLOCK NOW ONLY PROTECTS THE DATABASE OPERATION ---
    # This is the correct pattern. We only catch unexpected crashes.
    try:
        created_user = crud.create_user(db=db, user=user)
        return created_user
    except IntegrityError:
        # This is a fallback in case two users try to register at the exact same time.
        db.rollback()
        raise HTTPException(
            status_code=409, # 409 Conflict is more appropriate here
            detail="Username or email already exists."
        )
    except Exception as e:
        # This will catch any other unexpected server errors.
        db.rollback()
        print(f"An unexpected error occurred during user creation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An internal server error occurred during registration."
        )


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)
):
    """Handles user login with either username or email."""
    user = crud.authenticate_user(db, username_or_email=form_data.username, password=form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username, email, or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/users/me", response_model=schemas.User)
async def read_users_me(current_user: Annotated[models.User, Depends(get_current_active_user)]):
    """Fetches the profile of the currently authenticated user."""
    return current_user