import os
import secrets
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
  # Database
  databaseUrl: str

  # JWT
  jwtSecretKey: str = secrets.token_urlsafe(32)
  jwtAlgorithm: str = "HS256"
  jwtExpirationMinutes: int = 20

  # Tour API
  tourapikey: str

  # Kakao Map API
  kakaomap_restapi_key: str

  # File Storage
  uploadsDir: str = "uploads"
  maxFileSize: int = 10 * 1024 * 1024  # 10MB
  allowedExtensions: set = {".jpg", ".jpeg", ".png", ".webp"}

  # App
  appName: str = "Bapful API"
  appVersion: str = "1.0.0"
  debugMode: bool = False

  class Config:
    env_file = ".env"

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.uploadsDir, exist_ok=True)