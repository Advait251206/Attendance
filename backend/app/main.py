# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from . import models
from .routers import auth, attendance

# This line ensures that database tables are created if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Extreme Attendance Tracker API",
    version="1.0.0",
)

# --- CORS Configuration ---
origins = [
    "https://attendance-omega-sand.vercel.app", 
    "https://fuzzy-palm-tree-97qrwvppr9g7f7pv9-3000.app.github.dev", 
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- API Routers ---
# We are adding the /api prefix here, in the main app.
# Now all routes from auth.py and attendance.py will start with /api
app.include_router(auth.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")

@app.get("/", tags=["Root"])
async def read_root():
    """A simple root endpoint to confirm the API is running."""
    return {"status": "API is running", "docs_url": "/docs"}