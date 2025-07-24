# backend/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- Vercel/Neon Database Configuration ---

# 1. Get the database URL provided by Vercel's Neon integration.
#    If this variable is not found, it means we are likely in a local environment.
DATABASE_URL = os.getenv("POSTGRES_URL")

connect_args = {}
db_url_to_use = ""

if DATABASE_URL:
    # --- Production/Vercel Environment ---
    
    # 2. Vercel's URL starts with 'postgres://' but SQLAlchemy requires 'postgresql://'.
    #    We replace it to ensure compatibility.
    db_url_to_use = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
    # 3. Cloud databases require a secure SSL connection. We add this as a connection
    #    argument instead of in the URL string for better reliability.
    connect_args = {"sslmode": "require"}
else:
    # --- Local Development Environment ---
    
    # 4. If POSTGRES_URL isn't set, fall back to a local SQLite database file.
    #    This allows you to test locally without needing a cloud database.
    db_url_to_use = "sqlite:///./local_dev.db"
    connect_args = {"check_same_thread": False} # Required for SQLite


# Create the SQLAlchemy engine with the correct URL and connection arguments.
engine = create_engine(db_url_to_use, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get a DB session for each API request.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()