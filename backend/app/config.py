import os
import secrets
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    databaseUrl: str

    # Tour API
    tourapiKey: str

    # JWT
    jwtSecretKey: str
    jwtAlgorithm: str
    jwtExpirationMinutes: int
    
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
    environment: str = "development"  # development, production

    class Config:
        env_file = ".env"
        case_sensitive = False

    @property
    def effective_database_url(self) -> str:
        return self.databaseUrl or self.DATABASE_URL

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.uploadsDir, exist_ok=True)