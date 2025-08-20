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
  # Keyword based search has auth issues
  # tourAPIUrl = f"http://apis.data.go.kr/B551011/TarRlteTarService1/searchKeyword1?serviceKey={settings.tourAPIKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&baseYm=202503&areaCd=51&signguCd=51130&keyword=음식&_type=json"

  # Use area based search for now
  tourAPIUrl = f"http://apis.data.go.kr/B551011/TarRlteTarService1/areaBasedList1?serviceKey={settings.tourAPIKey}&numOfRows=10&pageNo=1&MobileOS=ETC&MobileApp=AppTest&baseYm=202503&areaCd=51&signguCd=51130&_type=json"


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

    response = requests.get(LocationService.tourAPIUrl).json()['response']['body']['items']['item']
    result = []
    for item in response:
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
    print(result)
    resultToLocationResponse = [LocationResponse.model_validate(location) for location in result]
    print(resultToLocationResponse)
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
    # Query the database for locations within radius
    locations = db.query(Location).filter(
      func.sqrt(
        (Location.latitude - lat) * (Location.latitude - lat) + (Location.longitude - lng) * (Location.longitude - lng)
      ) <= radius
    ).all()

    kakaoLocations = LocationService.getKakaoLocations(lat, lng, radius)
    tourAPILocations = LocationService.getTourAPILocations(lat, lng, radius)

    # Async save result to db
    locations = locations + kakaoLocations + tourAPILocations
    print(locations)

    return locations

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