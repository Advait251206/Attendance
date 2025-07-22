from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine
from . import models
from .routers import auth, attendance

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Extreme Attendance Tracker API",
    version="1.0.0",
)

# --- Define the specific URLs of your frontend environments ---

# 1. The URL for your live frontend on Render
#    REPLACE THIS with the actual URL of your deployed frontend
live_frontend_url = "https://attendance-website-cweo.onrender.com" 

# 2. The URL for your development frontend in Codespaces
codespaces_frontend_url = "https://fuzzy-palm-tree-97qrwvppr9g7f7pv9-3000.app.github.dev" 

# Create a list of allowed origins
origins = [
    live_frontend_url,
    codespaces_frontend_url,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Use the specific list
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(attendance.router)

@app.get("/", tags=["Root"])
async def read_root():
    return {"status": "API is running", "docs_url": "/docs"}