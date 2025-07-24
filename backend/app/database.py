# backend/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Get the database URL from the environment variable, default to local SQLite for development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./local_dev.db")

connect_args = {}

# Check if the connection is for PostgreSQL (which Vercel/Neon uses)
if DATABASE_URL.startswith("postgresql://"):
    # If it's a PostgreSQL DB, we require SSL, which is standard for cloud databases
    connect_args = {"sslmode": "require"}
elif DATABASE_URL.startswith("sqlite"):
    # If it's the local SQLite DB, we need to allow multithreading for FastAPI
    connect_args = {"check_same_thread": False}

# Create the SQLAlchemy engine with the correct arguments
engine = create_engine(DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()