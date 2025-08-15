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