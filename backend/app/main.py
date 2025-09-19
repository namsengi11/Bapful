import logging
import os
from pathlib import Path
from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from .config import settings
from .database import engine, Base, getDatabaseSession
from .models import Location, Review, User
from .auth import getPasswordHash
from .routes import auth, locations, menus, heatmap, recommendations, chat

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

# React build directory path
REACT_BUILD_DIR = Path(__file__).parent.parent.parent / "frontend-web" / "build"

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

# Include routers with /api prefix
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(locations.router, prefix="/api/locations", tags=["locations"])
app.include_router(menus.router, prefix="/api/menus", tags=["menus"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["recommendations"])
app.include_router(heatmap.router, prefix="/api/heatmap", tags=["heatmap"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory=settings.uploadsDir), name="uploads")

# Serve React static files
if REACT_BUILD_DIR.exists():
  app.mount("/static", StaticFiles(directory=str(REACT_BUILD_DIR / "static")), name="static")
  logger.info(f"Serving React static files from {REACT_BUILD_DIR / 'static'}")
else:
  logger.warning(f"React build directory not found: {REACT_BUILD_DIR}")

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
@app.get("/api/health")
async def healthCheck():
  """Health check endpoint"""
  return {"status": "healthy", "app": settings.appName, "version": settings.appVersion}

# API root endpoint
@app.get("/api")
async def apiRoot():
  """API root endpoint with information"""
  return {
    "message": f"Welcome to {settings.appName} API",
    "version": settings.appVersion,
    "docs": "/docs",
    "health": "/api/health"
  }

# Serve React app for all other routes (SPA routing)
@app.get("/{path:path}")
async def serveReactApp(path: str):
  """Serve React app for all non-API routes"""
  # Check if it's an API route
  if path.startswith("api/") or path.startswith("uploads/") or path.startswith("static/"):
    raise HTTPException(status_code=404, detail="Not found")
  
  # Serve index.html for all other routes (SPA routing)
  if REACT_BUILD_DIR.exists():
    index_file = REACT_BUILD_DIR / "index.html"
    if index_file.exists():
      return FileResponse(str(index_file))
  
  # Fallback if React build not found
  return JSONResponse(
    status_code=503,
    content={"detail": "Frontend not available. Please build the React app."}
  )

# Root endpoint - serve React app
@app.get("/")
async def root():
  """Root endpoint - serve React app"""
  if REACT_BUILD_DIR.exists():
    index_file = REACT_BUILD_DIR / "index.html"
    if index_file.exists():
      return FileResponse(str(index_file))
  
  # Fallback if React build not found
  return JSONResponse(
    status_code=503,
    content={"detail": "Frontend not available. Please build the React app."}
  )

if __name__ == "__main__":
  import uvicorn
  uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)