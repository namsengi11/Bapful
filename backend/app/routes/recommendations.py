from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import getDatabaseSession
from ..services import RecommendationService

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("")
def get_recommendations(
  lat: Optional[float] = Query(None, description="User latitude for proximity sorting"),
  lng: Optional[float] = Query(None, description="User longitude for proximity sorting"),
  per_category: int = Query(8, le=50, ge=1),
  db: Session = Depends(getDatabaseSession)
):
  """Return categorized recommendation sections.

  Categories (if data exists): popular, top_rated, nearby (if lat/lng), new.
  Each item contains: location_id, name, location_type, coordinates, avg_rating, review_count, distance(optional)
  """
  sections = RecommendationService.getRecommendations(db, lat, lng, per_category)
  return sections
