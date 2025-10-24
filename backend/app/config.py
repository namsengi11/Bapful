import os
import secrets
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "sqlite:///./bapful.db"
    # 과거 camelCase 호환
    databaseUrl: str | None = None

    SEED_DUMMY: bool = False  # 필요 시 .env 에 SEED_DUMMY=true


    # JWT
    jwtSecretKey: str = secrets.token_urlsafe(32)
    jwtAlgorithm: str = "HS256"
    jwtExpirationMinutes: int = 20

    # Tour API
    tourapiKey: str = ""
    tourapiMandatoryKey: str = ""

    # Kakao Map API
    kakaomap_restapi_key: str = ""

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