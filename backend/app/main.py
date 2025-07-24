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

# --- Define the specific URLs of your frontend environments ---
# This list tells your backend which frontend URLs are allowed to make requests.
origins = [
    # The URL of your live frontend on Vercel (from your video)
    "https://attendance-omega-sand.vercel.app", 
    
    # The URL for your development frontend in GitHub Codespaces
    "https://fuzzy-palm-tree-97qrwvppr9g7f7pv9-3000.app.github.dev", 
    
    # A good practice is to also include the localhost for local testing
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Use the specific list of allowed origins
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# Include the routers for authentication and attendance
app.include_router(auth.router)
app.include_router(attendance.router)

@app.get("/", tags=["Root"])
async def read_root():
    """A simple root endpoint to confirm the API is running."""
    return {"status": "API is running", "docs_url": "/docs"}