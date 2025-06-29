from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
  name: str
  email: EmailStr
  password: str

class UserLogin(BaseModel):
  email: EmailStr
  password: str

class UserResponse(BaseModel):
  id: str
  name: str
  email: str

class AuthResponse(BaseModel):
  token: str
  user: UserResponse

# Location schemas
class Coordinates(BaseModel):
  lat: float
  lng: float

class LocationCreate(BaseModel):
  name: str
  location_type: str
  coordinates: Coordinates
  address: Optional[str] = None
  description: Optional[str] = None

class LocationResponse(BaseModel):
  id: str
  name: str
  location_type: str
  coordinates: Coordinates
  avg_rating: Optional[float] = None
  review_count: Optional[int] = None

  class Config:
    from_attributes = True

class LocationsQuery(BaseModel):
  lat: float
  lng: float
  radius: Optional[int] = 1000

# Review schemas
class ReviewCreate(BaseModel):
  rating: int = Field(ge=1, le=5)
  comment: Optional[str] = None

class ReviewRatingCreate(BaseModel):
  rating: str = Field(pattern="^(up|down)$")

class ReviewUser(BaseModel):
  id: str
  name: str

class ReviewResponse(BaseModel):
  id: str
  user: ReviewUser
  rating: int
  comment: Optional[str]
  timestamp: datetime
  upvotes: Optional[int] = 0
  downvotes: Optional[int] = 0

class ReviewRatingResponse(BaseModel):
  reviewId: str = Field(alias="review_id")
  upvotes: int
  downvotes: int

# Menu schemas
class BoundingBox(BaseModel):
  x: float
  y: float
  width: float
  height: float

class MenuLabel(BaseModel):
  boundingBox: BoundingBox = Field(alias="bounding_box")
  original: str
  translated: str
  price: Optional[str] = None

class MenuUploadResponse(BaseModel):
  photoUrl: str = Field(alias="photo_url")
  labels: List[MenuLabel]

class MenuResponse(BaseModel):
  menuId: str = Field(alias="menu_id")
  translatedItems: List[MenuLabel] = Field(alias="translated_items")

# Pagination
class PaginationParams(BaseModel):
  limit: int = Field(default=10, le=50)
  offset: int = Field(default=0, ge=0)