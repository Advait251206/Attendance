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

# --- Define the specific URL of your frontend ---
# Replace this with the URL from your browser's address bar for the frontend
frontend_url = "https://fuzzy-palm-tree-97qrwvppr9g7f7pv9-3000.app.github.dev" 

origins = [
    frontend_url,
    # You can add more origins here if needed, e.g., for production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Use the specific list instead of "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(attendance.router)

@app.get("/", tags=["Root"])
async def read_root():
    return {"status": "API is running", "docs_url": "/docs"}