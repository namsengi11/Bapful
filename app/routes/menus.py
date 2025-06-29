from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging
import uuid

from ..database import getDatabaseSession
from ..auth import getCurrentUser
from ..models import User
from ..schemas import MenuUploadResponse, MenuResponse, MenuLabel, BoundingBox
from ..services import MenuService
from ..storage import fileStorage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/menus", tags=["menus"])

# ===== CORE MENU FUNCTIONALITY =====

@router.post("/upload-photo", response_model=MenuUploadResponse)
async def uploadMenuPhoto(
  photo: UploadFile = File(...),
  locationId: Optional[str] = Form(None),
  targetLanguage: Optional[str] = Form("en"),
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Upload a photo of a menu for translation and OCR processing"""
  try:
    # Save the uploaded file
    filePath, photoUrl = await fileStorage.saveFile(photo, "menus")

    # Mock translation service (replace with real OCR + translation)
    mockLabels = MenuService.mockTranslateMenu(filePath)

    # Convert to response format
    labels = []
    for item in mockLabels:
      label = MenuLabel(
        bounding_box=BoundingBox(**item["bounding_box"]),
        original=item["original"],
        translated=item["translated"],
        price=item.get("price")
      )
      labels.append(label)

    # Save menu to database
    menuId = MenuService.saveMenu(
      db,
      photoUrl,
      [item.dict() for item in labels],
      locationId
    )

    logger.info(f"Menu uploaded successfully: {menuId} by user {currentUser.id}")

    return MenuUploadResponse(
      photo_url=photoUrl,
      labels=labels
    )

  except HTTPException:
    raise
  except Exception as e:
    logger.error(f"Error uploading menu photo: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to upload and process menu photo"
    )

@router.get("/locations/{locationId}/menus", response_model=List[MenuResponse])
async def getLocationMenus(
  locationId: str,
  limit: int = Query(10, le=50, description="Number of menus to fetch"),
  offset: int = Query(0, ge=0, description="Number of menus to skip"),
  db: Session = Depends(getDatabaseSession)
):
  """Retrieve menus uploaded for a specific location"""
  try:
    menus = MenuService.getLocationMenus(db, locationId)

    # Apply pagination
    paginatedMenus = menus[offset:offset + limit]

    return [
      MenuResponse(
        menu_id=menu["menu_id"],
        translated_items=[
          MenuLabel(
            bounding_box=BoundingBox(**item["bounding_box"]),
            original=item["original"],
            translated=item["translated"],
            price=item.get("price")
          )
          for item in menu["translated_items"]
        ]
      )
      for menu in paginatedMenus
    ]

  except Exception as e:
    logger.error(f"Error fetching location menus: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch menus"
    )

# ===== MENU MANAGEMENT =====

@router.get("/{menuId}")
async def getMenu(
  menuId: str,
  db: Session = Depends(getDatabaseSession)
):
  """Get specific menu details"""
  try:
    # Mock implementation - replace with real database query
    return {
      "menu_id": menuId,
      "photo_url": f"/uploads/menus/{menuId}.jpg",
      "source_language": "ja",
      "target_language": "en",
      "confidence_score": 0.92,
      "is_verified": False,
      "created_at": "2025-01-15T10:00:00Z",
      "translated_items": [
        {
          "bounding_box": {"x": 0.2, "y": 0.3, "width": 0.4, "height": 0.05},
          "original": "餃子",
          "translated": "Dumplings",
          "price": "¥500"
        }
      ]
    }

  except Exception as e:
    logger.error(f"Error fetching menu {menuId}: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch menu"
    )

@router.put("/{menuId}")
async def updateMenu(
  menuId: str,
  targetLanguage: Optional[str] = None,
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Update menu details (re-translate to different language, etc.)"""
  try:
    # Mock implementation
    logger.info(f"Menu {menuId} updated by user {currentUser.id}")
    return {
      "menu_id": menuId,
      "message": "Menu updated successfully",
      "target_language": targetLanguage or "en",
      "updated_at": "2025-01-15T10:30:00Z"
    }

  except Exception as e:
    logger.error(f"Error updating menu {menuId}: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to update menu"
    )

@router.delete("/{menuId}")
async def deleteMenu(
  menuId: str,
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Delete a menu (only by owner or admin)"""
  try:
    # Mock implementation - add ownership check in real version
    logger.info(f"Menu {menuId} deleted by user {currentUser.id}")
    return {"message": "Menu deleted successfully"}

  except Exception as e:
    logger.error(f"Error deleting menu {menuId}: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to delete menu"
    )

# ===== MENU ITEMS =====

@router.get("/{menuId}/items")
async def getMenuItems(
  menuId: str,
  category: Optional[str] = Query(None, description="Filter by food category"),
  db: Session = Depends(getDatabaseSession)
):
  """Get individual menu items with detailed information"""
  try:
    # Mock implementation
    mockItems = [
      {
        "item_id": f"item_{uuid.uuid4().hex[:8]}",
        "name": "Gyoza (Dumplings)",
        "original_name": "餃子",
        "description": "Pan-fried pork and vegetable dumplings",
        "price": "¥500",
        "category": "appetizer",
        "dietary_info": ["contains_gluten", "contains_pork"],
        "spice_level": 1,
        "estimated_calories": 280
      },
      {
        "item_id": f"item_{uuid.uuid4().hex[:8]}",
        "name": "Fried Rice",
        "original_name": "炒飯",
        "description": "Wok-fried rice with vegetables and egg",
        "price": "¥800",
        "category": "main_course",
        "dietary_info": ["vegetarian_option"],
        "spice_level": 0,
        "estimated_calories": 450
      }
    ]

    # Filter by category if provided
    if category:
      mockItems = [item for item in mockItems if item["category"] == category]

    return mockItems

  except Exception as e:
    logger.error(f"Error fetching menu items for {menuId}: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch menu items"
    )

@router.post("/{menuId}/items")
async def addMenuItem(
  menuId: str,
  itemName: str = Form(...),
  originalName: str = Form(...),
  price: str = Form(...),
  category: Optional[str] = Form(None),
  description: Optional[str] = Form(None),
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Add a new menu item manually"""
  try:
    itemId = f"item_{uuid.uuid4().hex[:8]}"

    # Mock implementation
    newItem = {
      "item_id": itemId,
      "menu_id": menuId,
      "name": itemName,
      "original_name": originalName,
      "price": price,
      "category": category,
      "description": description,
      "added_by": currentUser.id,
      "created_at": "2025-01-15T10:00:00Z"
    }

    logger.info(f"Menu item {itemId} added to menu {menuId} by user {currentUser.id}")
    return newItem

  except Exception as e:
    logger.error(f"Error adding menu item: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to add menu item"
    )

# ===== USER INTERACTIONS =====

@router.post("/{menuId}/favorite")
async def favoriteMenu(
  menuId: str,
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Add menu to user's favorites"""
  try:
    favoriteId = f"fav_{uuid.uuid4().hex[:8]}"

    # Mock implementation
    logger.info(f"Menu {menuId} favorited by user {currentUser.id}")
    return {
      "favorite_id": favoriteId,
      "menu_id": menuId,
      "user_id": currentUser.id,
      "created_at": "2025-01-15T10:00:00Z"
    }

  except Exception as e:
    logger.error(f"Error favoriting menu: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to favorite menu"
    )

@router.delete("/{menuId}/favorite")
async def unfavoriteMenu(
  menuId: str,
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Remove menu from user's favorites"""
  try:
    # Mock implementation
    logger.info(f"Menu {menuId} unfavorited by user {currentUser.id}")
    return {"message": "Menu removed from favorites"}

  except Exception as e:
    logger.error(f"Error unfavoriting menu: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to unfavorite menu"
    )

@router.post("/{menuId}/corrections")
async def submitCorrection(
  menuId: str,
  originalText: str = Form(...),
  correctedText: str = Form(...),
  itemId: Optional[str] = Form(None),
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Submit a translation correction"""
  try:
    correctionId = f"corr_{uuid.uuid4().hex[:8]}"

    # Mock implementation
    correction = {
      "correction_id": correctionId,
      "menu_id": menuId,
      "item_id": itemId,
      "original_text": originalText,
      "corrected_text": correctedText,
      "submitted_by": currentUser.id,
      "votes": 0,
      "status": "pending",
      "created_at": "2025-01-15T10:00:00Z"
    }

    logger.info(f"Translation correction {correctionId} submitted for menu {menuId}")
    return correction

  except Exception as e:
    logger.error(f"Error submitting correction: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to submit correction"
    )

@router.get("/{menuId}/corrections")
async def getCorrections(
  menuId: str,
  status: Optional[str] = Query(None, description="Filter by status"),
  db: Session = Depends(getDatabaseSession)
):
  """Get community corrections for a menu"""
  try:
    # Mock implementation
    mockCorrections = [
      {
        "correction_id": f"corr_{uuid.uuid4().hex[:8]}",
        "original_text": "麻婆豆腐",
        "corrected_text": "Mapo Tofu (Spicy)",
        "current_text": "Mapo Tofu",
        "votes": 3,
        "status": "approved",
        "submitted_by": "user_123",
        "created_at": "2025-01-14T15:30:00Z"
      }
    ]

    # Filter by status if provided
    if status:
      mockCorrections = [corr for corr in mockCorrections if corr["status"] == status]

    return mockCorrections

  except Exception as e:
    logger.error(f"Error fetching corrections for menu {menuId}: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch corrections"
    )

# ===== USER'S MENU DATA =====

@router.get("/users/me/favorites")
async def getUserFavoriteMenus(
  limit: int = Query(20, le=100),
  offset: int = Query(0, ge=0),
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Get user's favorite menus"""
  try:
    # Mock implementation
    mockFavorites = [
      {
        "favorite_id": f"fav_{uuid.uuid4().hex[:8]}",
        "menu_id": "menu_456",
        "location_name": "Tokyo Ramen House",
        "location_id": "loc_101",
        "photo_url": "/uploads/menus/menu_456.jpg",
        "created_at": "2025-01-14T12:00:00Z"
      },
      {
        "favorite_id": f"fav_{uuid.uuid4().hex[:8]}",
        "menu_id": "menu_789",
        "location_name": "Seoul Kitchen",
        "location_id": "loc_789",
        "photo_url": "/uploads/menus/menu_789.jpg",
        "created_at": "2025-01-13T18:30:00Z"
      }
    ]

    # Apply pagination
    paginatedFavorites = mockFavorites[offset:offset + limit]

    return paginatedFavorites

  except Exception as e:
    logger.error(f"Error fetching user favorites: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch favorite menus"
    )

# ===== MENU VERIFICATION =====

@router.post("/{menuId}/verify")
async def verifyMenuTranslation(
  menuId: str,
  isAccurate: bool = Form(...),
  feedback: Optional[str] = Form(None),
  currentUser: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Mark menu translation as verified by community"""
  try:
    # Mock implementation
    verification = {
      "verification_id": f"verify_{uuid.uuid4().hex[:8]}",
      "menu_id": menuId,
      "user_id": currentUser.id,
      "is_accurate": isAccurate,
      "feedback": feedback,
      "created_at": "2025-01-15T10:00:00Z"
    }

    logger.info(f"Menu {menuId} verification submitted by user {currentUser.id}")
    return verification

  except Exception as e:
    logger.error(f"Error verifying menu: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to verify menu"
    )