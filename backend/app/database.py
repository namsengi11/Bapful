from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator
import logging

from .config import settings

logger = logging.getLogger(__name__)

engine = create_engine(settings.databaseUrl)
sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def getDatabaseSession() -> Generator[Session, None, None]:
  """Dependency to get database session"""
  db = sessionLocal()
  try:
    yield db
  except Exception as e:
    logger.error(f"Database session error: {e}")
    db.rollback()
    raise
  finally:
    db.close()