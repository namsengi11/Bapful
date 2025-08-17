from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy.orm import Session

from ..database import getDatabaseSession
from ..services import RecommendationService  # 변경: 올바른 서비스 임포트

router = APIRouter()

@router.get("")
def recommendations(
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    per_category: int = Query(8, ge=1, le=50),  # 서비스 기본(8)에 맞춤
    db: Session = Depends(getDatabaseSession),
):
    return RecommendationService.getRecommendations(
        db,
        lat=lat,
        lng=lng,
        per_category=per_category
    )
