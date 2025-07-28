import uuid
from datetime import datetime, timedelta
from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .config import settings
from .database import getDatabaseSession
from .models import User
from .schemas import UserResponse

passwordContext = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

def verifyPassword(plainPassword: str, hashedPassword: str) -> bool:
  """Verify a password against its hash"""
  return passwordContext.verify(plainPassword, hashedPassword)

def getPasswordHash(password: str) -> str:
  """Hash a password"""
  return passwordContext.hash(password)

def createAccessToken(data: dict, expiresDelta: Optional[timedelta] = None) -> str:
  """Create a JWT access token"""
  toEncode = data.copy()
  if expiresDelta:
    expire = datetime.utcnow() + expiresDelta
  else:
    expire = datetime.utcnow() + timedelta(minutes=settings.jwtExpirationMinutes)

  toEncode.update({"exp": expire})
  encodedJwt = jwt.encode(toEncode, settings.jwtSecretKey, algorithm=settings.jwtAlgorithm)
  return encodedJwt

def verifyToken(token: str) -> Optional[str]:
  """Verify JWT token and return user ID"""
  # TODO: Change to Access/Refresh token later
  try:
    payload = jwt.decode(token, settings.jwtSecretKey, algorithms=[settings.jwtAlgorithm])
    userId: str = payload.get("sub")
    if userId is None:
      return None
    return userId
  except JWTError:
    return None

def getUserByEmail(db: Session, email: str) -> Optional[User]:
  """Get user by email"""
  return db.query(User).filter(User.email == email).first()

def createUser(db: Session, name: str, email: str, password: str) -> User:
  """Create a new user"""
  hashedPassword = getPasswordHash(password)
  dbUser = User(
    id=f"user_{uuid.uuid4().hex[:8]}",
    name=name,
    email=email,
    hashedPassword=hashedPassword
  )
  db.add(dbUser)
  db.commit()
  db.refresh(dbUser)
  return dbUser

def authenticateUser(db: Session, email: str, password: str) -> Optional[User]:
  """Authenticate user with email and password"""
  user = getUserByEmail(db, email)
  if not user:
    return None
  if not verifyPassword(password, user.hashedPassword):
    return None
  return user

async def getCurrentUser(
  credentials: HTTPAuthorizationCredentials = Depends(security),
  db: Session = Depends(getDatabaseSession)
) -> User:
  """Get current authenticated user"""
  credentialsException = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
  )

  userId = verifyToken(credentials.credentials)
  if userId is None:
    raise credentialsException

  user = db.query(User).filter(User.id == userId).first()
  if user is None:
    raise credentialsException

  return user