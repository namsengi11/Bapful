from sqlalchemy import Column, Integer, String, DateTime, Float, Text, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

from .database import Base

class User(Base):
  __tablename__ = "users"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  name = Column(String, nullable=False)
  email = Column(String, unique=True, nullable=False, index=True)
  hashedPassword = Column(String, nullable=False)
  createdAt = Column(DateTime, default=func.now())
  updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())

  # Relationships
  reviews = relationship("Review", back_populates="user")
  reviewRatings = relationship("ReviewRating", back_populates="user")
  chatParticipants = relationship("ChatParticipant", back_populates="user")
  chatMessages = relationship("ChatMessage", back_populates="user")
  # lastLogin = relationship("LastLogin", back_populates="user")

class Location(Base):
  __tablename__ = "locations"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  name = Column(String, nullable=False)
  location_type = Column(String, nullable=False)
  latitude = Column(Float, nullable=False, index=True)
  longitude = Column(Float, nullable=False, index=True)
  address = Column(String)
  description = Column(Text)
  createdAt = Column(DateTime, default=func.now())
  updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())

  # Relationships
  images = relationship("Image", back_populates="location")
  reviews = relationship("Review", back_populates="location")
  menus = relationship("Menu", back_populates="location")

class Image(Base):
  __tablename__ = "images"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  locationId = Column(String, ForeignKey("locations.id"), nullable=False)
  imageUrl = Column(String, nullable=False)
  createdAt = Column(DateTime, default=func.now())

  location = relationship("Location", back_populates="images")

class Review(Base):
  __tablename__ = "reviews"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  userId = Column(String, ForeignKey("users.id"), nullable=False)
  locationId = Column(String, ForeignKey("locations.id"), nullable=False)
  rating = Column(Integer, nullable=False)  # 1-5
  comment = Column(Text)
  createdAt = Column(DateTime, default=func.now())
  updatedAt = Column(DateTime, default=func.now(), onupdate=func.now())

  # Relationships
  user = relationship("User", back_populates="reviews")
  location = relationship("Location", back_populates="reviews")
  ratings = relationship("ReviewRating", back_populates="review")

class ReviewRating(Base):
  __tablename__ = "review_ratings"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  userId = Column(String, ForeignKey("users.id"), nullable=False)
  reviewId = Column(String, ForeignKey("reviews.id"), nullable=False)
  rating = Column(String, nullable=False)  # "up" or "down"
  createdAt = Column(DateTime, default=func.now())

  # Relationships
  user = relationship("User", back_populates="reviewRatings")
  review = relationship("Review", back_populates="ratings")

class Menu(Base):
  __tablename__ = "menus"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  locationId = Column(String, ForeignKey("locations.id"), nullable=True)
  photoUrl = Column(String, nullable=False)
  translatedItems = Column(JSON)  # Stores the translated menu items
  createdAt = Column(DateTime, default=func.now())

  # Relationships
  location = relationship("Location", back_populates="menus")

class FileUpload(Base):
  __tablename__ = "file_uploads"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  filename = Column(String, nullable=False)
  filePath = Column(String, nullable=False)
  fileSize = Column(Integer, nullable=False)
  mimeType = Column(String, nullable=False)
  uploadedAt = Column(DateTime, default=func.now())

# class LastLogin(Base):
#   __tablename__ = "last_logins"

#   id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
#   userId = Column(String, ForeignKey("users.id"), nullable=False)
#   lastLoginTime = Column(DateTime, nullable=False)

#   # Relationships
#   user = relationship("User", back_populates="lastLogin")

class Chat(Base):
  __tablename__ = "chats"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

  # Relationships
  participants = relationship("ChatParticipant", back_populates="chat")
  messages = relationship("ChatMessage", back_populates="chat")

class ChatParticipant(Base):
  __tablename__ = "chat_participants"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  chatId = Column(String, ForeignKey("chats.id"), nullable=False)
  userId = Column(String, ForeignKey("users.id"), nullable=False)
  createdAt = Column(DateTime, default=func.now())

  chat = relationship("Chat", back_populates="participants")
  user = relationship("User", back_populates="chats")

class ChatMessage(Base):
  __tablename__ = "chat_messages"

  id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
  chatId = Column(String, ForeignKey("chats.id"), nullable=False)
  userId = Column(String, ForeignKey("users.id"), nullable=False)
  message = Column(Text, nullable=False)
  createdAt = Column(DateTime, default=func.now())

  chat = relationship("Chat", back_populates="messages")
  user = relationship("User", back_populates="messages")