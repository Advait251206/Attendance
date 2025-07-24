# backend/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Use Vercel's default environment variable for Postgres
DATABASE_URL = os.getenv("POSTGRES_URL")

connect_args = {}
db_url_to_use = ""

try:
    if DATABASE_URL:
        # Production/Vercel Environment
        db_url_to_use = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        connect_args = {"sslmode": "require"}
        print("INFO: Connecting to Vercel Postgres database.")
    else:
        # Local Development Environment
        db_url_to_use = "sqlite:///./local_dev.db"
        connect_args = {"check_same_thread": False}
        print("INFO: Connecting to local SQLite database.")

    # Create the SQLAlchemy engine
    engine = create_engine(db_url_to_use, connect_args=connect_args)

    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()
    
    # Test the connection
    with engine.connect() as connection:
        print("SUCCESS: Database connection established successfully.")

except Exception as e:
    print("--- DATABASE CONNECTION FAILED ---")
    print(f"ERROR: Could not create engine or connect to the database.")
    print(f"DATABASE_URL used: {db_url_to_use}")
    print(f"Exception: {e}")
    # Raise the exception to prevent the app from starting incorrectly
    raise

# Dependency to get a DB session for each API request.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()