import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from .config import settings
from .database import engine, Base, SessionLocal
from .models import Location, Review, User
from .auth import getPasswordHash
from sqlalchemy.orm import Session
import uuid
from .routes import auth, locations, menus, heatmap, recommendations

# Configure logging
logging.basicConfig(
  level=logging.INFO,
  format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create database tables
try:
  Base.metadata.create_all(bind=engine)
  logger.info("Database tables created successfully")
except Exception as e:
  logger.error(f"Failed to create database tables: {e}")

# Create FastAPI app
app = FastAPI(
  title=settings.appName,
  version=settings.appVersion,
  description="API for Bapful - Travel Restaurant Review App"
)

# CORS middleware
app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # Configure appropriately for production
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

# Seed dummy data if empty
def seed_dummy_data():
  db: Session = SessionLocal()
  try:
    if db.query(Location).count() == 0:
      # Ensure at least one user exists for reviews
      user = db.query(User).first()
      if not user:
        user = User(id=str(uuid.uuid4()), name="Demo User", email="demo@example.com", hashedPassword=getPasswordHash("password"))
        db.add(user)
        db.flush()

      dummy_locations = [
        {"name": "Mapo BBQ", "location_type": "restaurant", "lat": 37.5665, "lng": 126.9780, "address": "Seoul", "desc": "Classic Korean BBQ."},
        {"name": "Kimchi House", "location_type": "restaurant", "lat": 37.5651, "lng": 126.9895, "address": "Seoul", "desc": "Homemade kimchi specials."},
        {"name": "Bibimbap Corner", "location_type": "restaurant", "lat": 37.5700, "lng": 126.9768, "address": "Seoul", "desc": "Fresh bibimbap bowls."},
        {"name": "Spicy Tteokbokki", "location_type": "restaurant", "lat": 37.5682, "lng": 126.9820, "address": "Seoul", "desc": "Chewy rice cakes & fish cakes."},
      ]
      new_loc_objs = []
      for d in dummy_locations:
        loc = Location(
          name=d["name"],
          location_type=d["location_type"],
          latitude=d["lat"],
          longitude=d["lng"],
          address=d["address"],
          description=d["desc"],
        )
        db.add(loc)
        new_loc_objs.append(loc)
      db.flush()
      # Add a couple of reviews to generate ratings
      for loc in new_loc_objs:
        r1 = Review(userId=user.id, locationId=loc.id, rating=5, comment=f"Great food at {loc.name}")
        r2 = Review(userId=user.id, locationId=loc.id, rating=4, comment=f"Nice atmosphere at {loc.name}")
        db.add_all([r1, r2])
      db.commit()
      logger.info("Seeded dummy locations & reviews")
  except Exception as e:
    logger.error(f"Failed seeding dummy data: {e}")
    db.rollback()
  finally:
    db.close()

seed_dummy_data()

# Include routers
app.include_router(auth.router)
app.include_router(locations.router)
app.include_router(menus.router)
app.include_router(heatmap.router)
app.include_router(recommendations.router)

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=settings.uploadsDir), name="uploads")

# Global exception handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemyExceptionHandler(request: Request, exc: SQLAlchemyError):
  logger.error(f"Database error: {exc}")
  return JSONResponse(
    status_code=500,
    content={"detail": "Database error occurred"}
  )

@app.exception_handler(HTTPException)
async def httpExceptionHandler(request: Request, exc: HTTPException):
  logger.warning(f"HTTP exception: {exc.status_code} - {exc.detail}")
  return JSONResponse(
    status_code=exc.status_code,
    content={"detail": exc.detail}
  )

@app.exception_handler(Exception)
async def generalExceptionHandler(request: Request, exc: Exception):
  logger.error(f"Unexpected error: {exc}")
  return JSONResponse(
    status_code=500,
    content={"detail": "Internal server error"}
  )

# Health check endpoint
@app.get("/health")
async def healthCheck():
  """Health check endpoint"""
  return {"status": "healthy", "app": settings.appName, "version": settings.appVersion}

# Root endpoint
@app.get("/")
async def root():
  """Root endpoint with API information"""
  return {
    "message": f"Welcome to {settings.appName}",
    "version": settings.appVersion,
    "docs": "/docs",
    "health": "/health"
  }

if __name__ == "__main__":
  import uvicorn
  uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)