from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from ..database import getDatabaseSession
from ..auth import getCurrentUser
from ..models import User
from ..schemas import (
  LocationResponse,
  LocationCreate,
  ReviewResponse,
  ReviewCreate,
  ReviewRatingCreate,
  ReviewRatingResponse,
  PaginationParams
)
from ..services import LocationService, ReviewService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/locations", tags=["locations"])

@router.get("", response_model=List[LocationResponse])
async def getNearbyLocations(
  lat: float = Query(..., description="Latitude"),
  lng: float = Query(..., description="Longitude"),
  radius: int = Query(1000, description="Radius in meters"),
  db: Session = Depends(getDatabaseSession)
):
  """Get nearby reviewed locations"""
  try:
    locations = LocationService.getNearbyLocations(db, lat, lng, radius)
    return [
      LocationResponse(
        id=loc["id"],
        name=loc["name"],
        location_type=loc["location_type"],
        coordinates=loc["coordinates"],
        avg_rating=loc["avg_rating"],
        review_count=loc["review_count"]
      )
      for loc in locations
    ]

  except Exception as e:
    logger.error(f"Error fetching nearby locations: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch locations"
    )

@router.post("", response_model=LocationResponse)
async def createLocation(
  locationData: LocationCreate,
  # currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Create a new location"""
  return LocationService.createLocation(db, locationData)

@router.get("/{locationId}", response_model=LocationResponse)
async def getLocation(
  locationId: str,
  db: Session = Depends(getDatabaseSession)
):
  """Get a specific location"""
  return LocationService.getLocation(db, locationId)

@router.get("/{locationId}/reviews", response_model=List[ReviewResponse])
async def getLocationReviews(
  locationId: str,
  limit: int = Query(10, le=50, description="Number of reviews to fetch"),
  offset: int = Query(0, ge=0, description="Number of reviews to skip"),
  db: Session = Depends(getDatabaseSession)
):
  """Fetch reviews for a specific location with pagination"""
  try:
    reviews = LocationService.getLocationReviews(db, locationId, limit, offset)

    return [
      ReviewResponse(
        id=review["id"],
        user=review["user"],
        rating=review["rating"],
        comment=review["comment"],
        timestamp=review["timestamp"],
        upvotes=review["upvotes"],
        downvotes=review["downvotes"]
      )
      for review in reviews
    ]

  except Exception as e:
    logger.error(f"Error fetching location reviews: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch reviews"
    )

@router.post("/{locationId}/reviews")
async def createLocationReview(
  locationId: str,
  reviewData: ReviewCreate,
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Submit a new review for a location"""
  try:
    review = ReviewService.createReview(
      db,
      currentUser.id,
      locationId,
      reviewData.rating,
      reviewData.comment
    )

    return review

  except Exception as e:
    logger.error(f"Error creating review: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to create review"
    )

@router.post("/{locationId}/review/{reviewId}/rate", response_model=ReviewRatingResponse)
async def rateReview(
  locationId: str,
  reviewId: str,
  ratingData: ReviewRatingCreate,
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Rate a review (upvote/downvote)"""
  try:
    result = ReviewService.rateReview(
      db,
      currentUser.id,
      reviewId,
      ratingData.rating
    )

    return ReviewRatingResponse(
      review_id=result["review_id"],
      upvotes=result["upvotes"],
      downvotes=result["downvotes"]
    )

  except Exception as e:
    logger.error(f"Error rating review: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to rate review"
    )

@router.get("/search")
async def searchLocations(
  query: str,
  lat: float = Query(..., description="Latitude"),
  lng: float = Query(..., description="Longitude"),
  db: Session = Depends(getDatabaseSession)
):
  """Search for locations"""
  return LocationService.searchLocations(db, query, lat, lng)