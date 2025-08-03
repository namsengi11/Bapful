from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from ..database import getDatabaseSession
from ..auth import authenticateUser, createUser, getUserByEmail, createAccessToken
from ..schemas import UserCreate, UserLogin, AuthResponse, UserResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=AuthResponse)
async def register(
  userData: UserCreate,
  db: Session = Depends(getDatabaseSession)
):
  """Register a new user"""
  try:
    # Check if user already exists
    existingUser = getUserByEmail(db, userData.email)
    if existingUser:
      raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Email already registered"
      )

    # Create new user
    user = createUser(db, userData.name, userData.email, userData.password)

    # Create access token
    accessToken = createAccessToken(data={"sub": user.id})

    return AuthResponse(
      token=accessToken,
      user=UserResponse(
        id=user.id,
        name=user.name,
        email=user.email
      )
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Registration error: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to register user"
    )

@router.post("/login", response_model=AuthResponse)
async def login(
  loginData: UserLogin,
  db: Session = Depends(getDatabaseSession)
):
  """Authenticate user and return JWT token"""
  try:
    user = authenticateUser(db, loginData.email, loginData.password)
    if not user:
      raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password"
      )

    # Create access token
    accessToken = createAccessToken(data={"sub": user.id})

    # # Invalidate previous token if record exist
    # invalidateToken(db, user.id)

    return AuthResponse(
      token=accessToken,
      user=UserResponse(
        id=user.id,
        name=user.name,
        email=user.email
      )
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Login error: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Authentication failed"
    )