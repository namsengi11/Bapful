import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from .config import settings
from .database import engine, Base
from .routes import auth, locations, menus, heatmap, chat

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
  root_path="/api",
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

# Include routers
app.include_router(auth.router)
app.include_router(locations.router)
app.include_router(menus.router)
app.include_router(heatmap.router)
app.include_router(chat.router)

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