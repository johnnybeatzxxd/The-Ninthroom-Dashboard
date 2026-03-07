from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from peewee import OperationalError

from database import db
from models import ModelEntity, DailyConvoLog, DailySubLog, Refill, Event, Goal, Setting
from routers import models, logs, refills, config

import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Ninthroom Dashboard API", description="Backend API for the Ninthroom platform")

# Configure CORS
origins = [
    "http://localhost:5173", # Vite dev server
    "http://localhost:3000",
    "*" # allowing all for now to avoid issues, you can lock down later
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect DB and create tables
@app.on_event("startup")
def startup():
    try:
        if db.is_closed():
            db.connect()
            logger.info("Connected to database successfully.")
        
        # Create tables safely
        db.create_tables([ModelEntity, DailyConvoLog, DailySubLog, Refill, Event, Goal, Setting], safe=True)
        logger.info("Tables created or already exist.")
    except OperationalError as e:
        logger.error(f"Error connecting to database: {e}")

@app.on_event("shutdown")
def shutdown():
    if not db.is_closed():
        db.close()
        logger.info("Database connection closed.")

# Include routers here
app.include_router(models.router)
app.include_router(logs.router)
app.include_router(refills.router)
app.include_router(config.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Ninthroom Dashboard API. Navigate to /docs for Swagger documentation."}
