import uuid
import random
import requests

from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from math import radians, cos, sin, asin, sqrt
from fastapi import HTTPException

from .config import settings
from .models import User, Location, Review, ReviewRating, Menu
from .schemas import MenuLabel, BoundingBox, LocationCreate, KakaoLocation, TourAPILocation, LocationResponse

def calculateDistance(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
  """Calculate distance between two coordinates in meters using Haversine formula"""
  lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])

  dlat = lat2 - lat1
  dlng = lng2 - lng1
  a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
  c = 2 * asin(sqrt(a))
  r = 6371000  # Radius of earth in meters
  return c * r

class LocationService:
  """Service for location-related operations"""

  # Use area based search for now
  tourAPIUrl = f"http://apis.data.go.kr/B551011/TarRlteTarService1/areaBasedList1?serviceKey={settings.tourapikey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&baseYm=202503&areaCd=11&signguCd=11110&_type=json"

  kakaoAPIUrl = "https://dapi.kakao.com/v2/local/search/keyword.json"
  kakaoAPIQuery = [
    "?query=",
    "&x=",
    "&y=",
    "&radius="
  ]

  @staticmethod
  def getLocation(db: Session, locationId: str) -> dict:
    """Get a specific location"""
    location = db.query(Location).filter(Location.id == locationId).first()
    if not location:
      raise HTTPException(status_code=404, detail="Location not found")
    # get avg rating and review count
    location.coordinates = {
      "lat": location.latitude,
      "lng": location.longitude
    }
    location.avg_rating = 4.0
    location.review_count = 10
    location.location_type = "restaurant"

    return location

  @staticmethod
  def createLocation(db: Session, locationData: LocationCreate) -> dict:
    """Create a new location"""
    print(locationData)
    # if currentUser.role != "admin":
    #   raise HTTPException(status_code=403, detail="You are not authorized to create a location")

    location = Location(
      name=locationData.name,
      location_type=locationData.location_type,
      latitude=locationData.coordinates.lat,
      longitude=locationData.coordinates.lng,
      address=locationData.address,
      description=locationData.description
    )

    db.add(location)
    db.commit()
    db.refresh(location)

    return LocationService.getLocation(db, location.id)

  @staticmethod
  def getTourAPILocations(lat: float, lng: float, radius: int = 1000) -> dict:
    """Get locations from tour API"""

    # Logic to get area code for API from lat, lng
    response = requests.get(LocationService.tourAPIUrl).json()
    try:
      items = response['response']['body']['items']['item']
    except:
      raise HTTPException(status_code=500, detail="Failed to get locations from tour API")
    result = []
    for item in items:
      if item['rlteCtgryLclsNm'] != "음식":
        continue
      # Extract name and find coordinates
      name = item['rlteTatsNm']
      coordinates = LocationService.getCoordFromKakao(name)
      item['x'] = coordinates[1]
      item['y'] = coordinates[0]
      item['address'] = coordinates[2]
      tourLocation = TourAPILocation.fromTourAPIResult(item)
      result.append(tourLocation)

    resultToLocationResponse = [LocationResponse.model_validate(location) for location in result]

    return resultToLocationResponse

  @staticmethod
  def getKakaoLocations(lat: float, lng: float, radius: int = 1000) -> List[dict]:
    """Get locations from Kakao API"""
    queryUrl = LocationService.kakaoAPIUrl + LocationService.kakaoAPIQuery[0] + "음식" + LocationService.kakaoAPIQuery[1] + str(lat) + LocationService.kakaoAPIQuery[2] + str(radius)
    response = requests.get(
      queryUrl,
      headers={"Authorization": f"KakaoAK {settings.kakaomap_restapi_key}"}
    )

    result = [KakaoLocation.fromKakaoAPIResult(location) for location in response.json()["documents"]]

    resultToLocationResponse = [LocationResponse.model_validate(location) for location in result]

    return resultToLocationResponse

  @staticmethod
  def getCoordFromKakao(queryName: str) -> Tuple[float, float, str]:
    """Get coordinates from Kakao API"""
    queryUrl = LocationService.kakaoAPIUrl + LocationService.kakaoAPIQuery[0] + queryName + LocationService.kakaoAPIQuery[1]
    response = requests.get(
      queryUrl,
      headers={"Authorization": f"KakaoAK {settings.kakaomap_restapi_key}"}
    )
    return response.json()["documents"][0]["y"], response.json()["documents"][0]["x"], response.json()["documents"][0]["address_name"]

  @staticmethod
  def getNearbyLocations(db: Session, lat: float, lng: float, radius: int = 1000) -> List[dict]:
    """Get locations within radius with average ratings"""
    # Query the database for locations within radius (simple in-Python filter for SQLite)
    locations = db.query(Location).all()
    db_results: List[dict] = []
    
    for loc in locations:
      distance = calculateDistance(lat, lng, loc.latitude, loc.longitude)
      if distance <= radius:
        # Aggregate rating (avg & count)
        review_q = db.query(Review).filter(Review.locationId == loc.id)
        review_count = review_q.count()
        if review_count:
          avg_rating = sum(r.rating for r in review_q) / review_count
        else:
          avg_rating = 0.0
        db_results.append({
          "id": loc.id,
          "name": loc.name,
          "location_type": loc.location_type,
          "coordinates": {"lat": loc.latitude, "lng": loc.longitude},
          "avg_rating": round(avg_rating, 2),
          "review_count": review_count
        })

    # Get external API locations
    kakaoLocations = LocationService.getKakaoLocations(lat, lng, radius)
    tourAPILocations = LocationService.getTourAPILocations(lat, lng, radius)

    # Combine all results
    all_locations = db_results + kakaoLocations + tourAPILocations
    print(all_locations)

    return all_locations

  @staticmethod
  def getLocationReviews(
    db: Session,
    locationId: str,
    limit: int = 10,
    offset: int = 0
  ) -> List[dict]:
    """Get reviews for a location with pagination"""
    reviews = db.query(Review, User).join(User).filter(
      Review.locationId == locationId
    ).offset(offset).limit(limit).all()

    result = []
    for review, user in reviews:
      # Count upvotes and downvotes
      upvotes = db.query(ReviewRating).filter(
        and_(ReviewRating.reviewId == review.id, ReviewRating.rating == "up")
      ).count()

      downvotes = db.query(ReviewRating).filter(
        and_(ReviewRating.reviewId == review.id, ReviewRating.rating == "down")
      ).count()

      result.append({
        "id": review.id,
        "user": {"id": user.id, "name": user.name},
        "rating": review.rating,
        "comment": review.comment,
        "timestamp": review.createdAt,
        "upvotes": upvotes,
        "downvotes": downvotes
      })

    return result

class ReviewService:
  """Service for review-related operations"""

  @staticmethod
  def createReview(
    db: Session,
    userId: str,
    locationId: str,
    rating: int,
    comment: Optional[str] = None
  ) -> dict:
    """Create a new review"""
    reviewId = f"rev_{uuid.uuid4().hex[:8]}"

    dbReview = Review(
      id=reviewId,
      userId=userId,
      locationId=locationId,
      rating=rating,
      comment=comment
    )

    db.add(dbReview)
    db.commit()
    db.refresh(dbReview)

    return {
      "id": reviewId,
      "location_id": locationId,
      "rating": rating,
      "comment": comment
    }

  @staticmethod
  def rateReview(
    db: Session,
    userId: str,
    reviewId: str,
    rating: str
  ) -> dict:
    """Rate a review (up/down vote)"""
    # Check if user already rated this review
    existingRating = db.query(ReviewRating).filter(
      and_(ReviewRating.userId == userId, ReviewRating.reviewId == reviewId)
    ).first()

    if existingRating:
      # Update existing rating
      existingRating.rating = rating
    else:
      # Create new rating
      ratingId = f"rating_{uuid.uuid4().hex[:8]}"
      dbRating = ReviewRating(
        id=ratingId,
        userId=userId,
        reviewId=reviewId,
        rating=rating
      )
      db.add(dbRating)

    db.commit()

    # Count total upvotes and downvotes
    upvotes = db.query(ReviewRating).filter(
      and_(ReviewRating.reviewId == reviewId, ReviewRating.rating == "up")
    ).count()

    downvotes = db.query(ReviewRating).filter(
      and_(ReviewRating.reviewId == reviewId, ReviewRating.rating == "down")
    ).count()

    return {
      "review_id": reviewId,
      "upvotes": upvotes,
      "downvotes": downvotes
    }

class MenuService:
  """Service for menu-related operations"""

  @staticmethod
  def mockTranslateMenu(filePath: str) -> List[MenuLabel]:
    """Mock menu translation service - returns dummy translated items"""
    # In production, this would use OCR + translation APIs
    mockItems = [
      {
        "bounding_box": {"x": 0.2, "y": 0.3, "width": 0.4, "height": 0.05},
        "original": "餃子",
        "translated": "Dumplings",
        "price": "¥500"
      },
      {
        "bounding_box": {"x": 0.2, "y": 0.4, "width": 0.3, "height": 0.05},
        "original": "炒飯",
        "translated": "Fried Rice",
        "price": "¥800"
      },
      {
        "bounding_box": {"x": 0.2, "y": 0.5, "width": 0.35, "height": 0.05},
        "original": "麻婆豆腐",
        "translated": "Mapo Tofu",
        "price": "¥650"
      }
    ]

    return mockItems

  @staticmethod
  def saveMenu(
    db: Session,
    photoUrl: str,
    labels: List[dict],
    locationId: Optional[str] = None
  ) -> str:
    """Save menu to database"""
    menuId = f"menu_{uuid.uuid4().hex[:8]}"

    dbMenu = Menu(
      id=menuId,
      locationId=locationId,
      photoUrl=photoUrl,
      translatedItems=labels
    )

    db.add(dbMenu)
    db.commit()

    return menuId

  @staticmethod
  def getLocationMenus(db: Session, locationId: str) -> List[dict]:
    """Get menus for a location"""
    menus = db.query(Menu).filter(Menu.locationId == locationId).all()

    return [
      {
        "menu_id": menu.id,
        "translated_items": menu.translatedItems or []
      }
      for menu in menus
    ]

class RecommendationService:
  """Build recommendation sections using existing location & review data."""

  @staticmethod
  def getRecommendations(
    db: Session,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
    per_category: int = 8
  ) -> List[dict]:
    # Base locations
    all_locations = db.query(Location).all()
    if not all_locations:
      return []

    # Pre-compute aggregates
    aggregates = []
    for loc in all_locations:
      reviews = db.query(Review).filter(Review.locationId == loc.id).all()
      review_count = len(reviews)
      avg_rating = sum(r.rating for r in reviews)/review_count if review_count else 0.0
      distance = None
      if lat is not None and lng is not None:
        distance = calculateDistance(lat, lng, loc.latitude, loc.longitude)
      aggregates.append({
        "id": loc.id,
        "name": loc.name,
        "location_type": loc.location_type,
        "lat": loc.latitude,
        "lng": loc.longitude,
        "avg_rating": round(avg_rating,2),
        "review_count": review_count,
        "distance": distance
      })

    def section(name: str, items: List[dict]):
      return {
        "category": name,
        "items": [
          {
            "location_id": it["id"],
            "name": it["name"],
            "location_type": it["location_type"],
            "coordinates": {"lat": it["lat"], "lng": it["lng"]},
            "avg_rating": it["avg_rating"],
            "review_count": it["review_count"],
            "distance": it["distance"],
          }
          for it in items[:per_category]
        ]
      }

    # Popular (by review count)
    popular = sorted(aggregates, key=lambda x: x["review_count"], reverse=True)
    # Top rated (avg rating with minimum 1 review)
    top_rated = sorted([a for a in aggregates if a["review_count"] > 0], key=lambda x: (x["avg_rating"], x["review_count"]), reverse=True)
    # Nearby (if distance available)
    nearby = []
    if lat is not None and lng is not None:
      nearby = sorted([a for a in aggregates if a["distance"] is not None], key=lambda x: x["distance"])
    # New (recent createdAt) -- fall back to UUID order if createdAt not loaded
    # For now reuse popular slice as placeholder or we could query ordering by createdAt.
    new_list = popular  # Placeholder

    sections: List[dict] = []
    if popular:
      sections.append(section("popular", popular))
    if top_rated:
      sections.append(section("top_rated", top_rated))
    if nearby:
      sections.append(section("nearby", nearby))
    if new_list:
      sections.append(section("new", new_list))

    return sections