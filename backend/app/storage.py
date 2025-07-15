import os
import uuid
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional, Tuple
from fastapi import UploadFile, HTTPException

from .config import settings

class FileStorageInterface(ABC):
  """Abstract interface for file storage"""

  @abstractmethod
  async def saveFile(self, file: UploadFile, folder: str = "") -> Tuple[str, str]:
    """Save file and return (file_path, public_url)"""
    pass

  @abstractmethod
  def deleteFile(self, filePath: str) -> bool:
    """Delete file and return success status"""
    pass

  @abstractmethod
  def getPublicUrl(self, filePath: str) -> str:
    """Get public URL for file"""
    pass

class LocalFileStorage(FileStorageInterface):
  """Local file storage implementation"""

  def __init__(self, baseDir: str = settings.uploadsDir):
    self.baseDir = Path(baseDir)
    self.baseDir.mkdir(exist_ok=True)

  async def saveFile(self, file: UploadFile, folder: str = "") -> Tuple[str, str]:
    """Save file to local storage"""
    # Validate file
    if not file.filename:
      raise HTTPException(status_code=400, detail="No filename provided")

    fileExtension = Path(file.filename).suffix.lower()
    if fileExtension not in settings.allowedExtensions:
      raise HTTPException(
        status_code=400,
        detail=f"File type not allowed. Allowed types: {settings.allowedExtensions}"
      )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    fileSize = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if fileSize > settings.maxFileSize:
      raise HTTPException(
        status_code=400,
        detail=f"File too large. Max size: {settings.maxFileSize} bytes"
      )

    # Generate unique filename
    uniqueFilename = f"{uuid.uuid4().hex}{fileExtension}"

    # Create folder path
    folderPath = self.baseDir / folder if folder else self.baseDir
    folderPath.mkdir(parents=True, exist_ok=True)

    # Save file
    filePath = folderPath / uniqueFilename
    with open(filePath, "wb") as buffer:
      shutil.copyfileobj(file.file, buffer)

    # Return relative path and public URL
    relativePath = str(filePath.relative_to(self.baseDir))
    publicUrl = self.getPublicUrl(relativePath)

    return relativePath, publicUrl

  def deleteFile(self, filePath: str) -> bool:
    """Delete file from local storage"""
    try:
      fullPath = self.baseDir / filePath
      if fullPath.exists():
        fullPath.unlink()
        return True
      return False
    except Exception:
      return False

  def getPublicUrl(self, filePath: str) -> str:
    """Get public URL for local file (would be replaced with CDN URL for S3)"""
    return f"/uploads/{filePath}"

class S3FileStorage(FileStorageInterface):
  """S3 file storage implementation (placeholder for future)"""

  def __init__(self, bucketName: str, region: str = "us-east-1"):
    self.bucketName = bucketName
    self.region = region
    # TODO: Initialize boto3 client

  async def saveFile(self, file: UploadFile, folder: str = "") -> Tuple[str, str]:
    """Save file to S3 (to be implemented)"""
    raise NotImplementedError("S3 storage not yet implemented")

  def deleteFile(self, filePath: str) -> bool:
    """Delete file from S3 (to be implemented)"""
    raise NotImplementedError("S3 storage not yet implemented")

  def getPublicUrl(self, filePath: str) -> str:
    """Get public URL for S3 file (to be implemented)"""
    raise NotImplementedError("S3 storage not yet implemented")

# Storage instance - easily swappable
fileStorage: FileStorageInterface = LocalFileStorage()