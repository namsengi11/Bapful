from fastapi import APIRouter, WebSocket, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional, Dict
import json
import logging
from datetime import datetime

from ..database import getDatabaseSession
from ..auth import getCurrentUser, verifyToken
from ..models import User, Chat, ChatParticipant, ChatMessage

router = APIRouter(tags=["chat"])
logger = logging.getLogger(__name__)

class ChatManager:
  def __init__(self):
    # Map of userId -> WebSocket connection
    self.user_connections: Dict[str, WebSocket] = {}
    # Map of chatId -> list of userIds
    self.chat_participants: Dict[str, List[str]] = {}

  async def connect(self, websocket: WebSocket, user_id: str):
    """Connect user to chat system"""
    token = websocket.headers.get("sec-websocket-protocol")
    await websocket.accept(subprotocol=token)
    self.user_connections[user_id] = websocket
    logger.info(f"User {user_id} connected to chat")

    # Send online status to all contacts
    await self.broadcast_user_status(user_id, "online")

    try:
      while True:
        data = await websocket.receive_json()
        await self.handle_message(user_id, data)
    except Exception as e:
      logger.error(f"Chat connection error: {e}")
    finally:
      await self.disconnect(user_id)

  async def disconnect(self, user_id: str):
    """Disconnect user from chat system"""
    if user_id in self.user_connections:
      del self.user_connections[user_id]

    # Broadcast offline status
    await self.broadcast_user_status(user_id, "offline")
    logger.info(f"User {user_id} disconnected from chat")

  async def handle_message(self, sender_id: str, data: dict):
    """Handle incoming chat message"""
    message_type = data.get("type")

    if message_type == "send_message":
      await self.send_message(sender_id, data)
    elif message_type == "typing":
      await self.handle_typing(sender_id, data)

  async def send_message(self, sender_id: str, data: dict):
    """Send message to recipient and save to database"""
    recipient_id = data.get("recipient_id")
    message_content = data.get("message", "").strip()

    if not recipient_id or not message_content:
      return

    # Get or create chat between users
    db = next(getDatabaseSession())
    try:
      chat = self.get_or_create_chat(db, sender_id, recipient_id)

      # Save message to database
      db_message = ChatMessage(
        chatId=chat.id,
        userId=sender_id,
        message=message_content
      )
      db.add(db_message)
      db.commit()
      db.refresh(db_message)

      # Prepare message for broadcasting
      message_data = {
        "type": "new_message",
        "message_id": db_message.id,
        "chat_id": chat.id,
        "sender_id": sender_id,
        "message": message_content,
        "timestamp": db_message.createdAt.isoformat()
      }

      # Send to sender (confirmation)
      await self.send_to_user(sender_id, message_data)

      # Send to recipient if online
      await self.send_to_user(recipient_id, message_data)

    except Exception as e:
      logger.error(f"Error sending message: {e}")
    finally:
      db.close()

  async def handle_typing(self, sender_id: str, data: dict):
    """Handle typing indicator"""
    recipient_id = data.get("recipient_id")
    is_typing = data.get("is_typing", False)

    if recipient_id:
      typing_data = {
        "type": "typing",
        "sender_id": sender_id,
        "is_typing": is_typing
      }
      await self.send_to_user(recipient_id, typing_data)

  async def send_to_user(self, user_id: str, message: dict):
    """Send message to specific user if online"""
    if user_id in self.user_connections:
      try:
        websocket = self.user_connections[user_id]
        await websocket.send_json(message)
      except Exception as e:
        logger.error(f"Error sending to user {user_id}: {e}")
        # Remove broken connection
        if user_id in self.user_connections:
          del self.user_connections[user_id]

  async def broadcast_user_status(self, user_id: str, status: str):
    """Broadcast user online/offline status to contacts"""
    # Get all users this user has chatted with
    db = next(getDatabaseSession())
    try:
      # Find all chats where this user is a participant
      user_chats = db.query(ChatParticipant).filter(
        ChatParticipant.userId == user_id
      ).all()

      contacted_users = set()
      for chat_participant in user_chats:
        # Get other participants in each chat
        other_participants = db.query(ChatParticipant).filter(
          and_(
            ChatParticipant.chatId == chat_participant.chatId,
            ChatParticipant.userId != user_id
          )
        ).all()

        for participant in other_participants:
          contacted_users.add(participant.userId)

      # Send status update to all contacted users
      status_data = {
        "type": "user_status",
        "user_id": user_id,
        "status": status,
        "timestamp": datetime.now().isoformat()
      }

      for contact_id in contacted_users:
        await self.send_to_user(contact_id, status_data)

    except Exception as e:
      logger.error(f"Error broadcasting status: {e}")
    finally:
      db.close()

  def get_or_create_chat(self, db: Session, user1_id: str, user2_id: str) -> Chat:
    """Get existing chat or create new one between two users"""
    # Find existing chat between these two users
    existing_chat = db.query(Chat).join(ChatParticipant).filter(
      ChatParticipant.userId.in_([user1_id, user2_id])
    ).group_by(Chat.id).having(
      db.func.count(ChatParticipant.userId) == 2
    ).first()

    if existing_chat:
      # Verify both users are in this chat
      participants = db.query(ChatParticipant).filter(
        ChatParticipant.chatId == existing_chat.id
      ).all()
      participant_ids = {p.userId for p in participants}

      if {user1_id, user2_id} == participant_ids:
        return existing_chat

    # Create new chat
    new_chat = Chat()
    db.add(new_chat)
    db.flush()  # Get the ID

    # Add participants
    participant1 = ChatParticipant(chatId=new_chat.id, userId=user1_id)
    participant2 = ChatParticipant(chatId=new_chat.id, userId=user2_id)

    db.add(participant1)
    db.add(participant2)
    db.commit()

    return new_chat

  def is_user_online(self, user_id: str) -> bool:
    """Check if user is currently online"""
    return user_id in self.user_connections

chat_manager = ChatManager()

@router.websocket("/ws")
async def chat_websocket(websocket: WebSocket):
  """WebSocket endpoint for real-time chat"""
  # Get token from headers (same as heatmap)
  token = websocket.headers.get("sec-websocket-protocol")
  user_id = verifyToken(token)

  if not user_id:
    await websocket.close(code=1008, reason="Invalid token")
    return

  await chat_manager.connect(websocket, user_id)

# REST API Endpoints

@router.get("/history/{other_user_id}")
async def getChatHistory(
  other_user_id: str,
  limit: int = Query(50, le=100, description="Number of messages to fetch"),
  offset: int = Query(0, ge=0, description="Number of messages to skip"),
  current_user: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Get chat history between current user and another user with pagination"""
  try:
    # Find the chat between these two users
    chat = db.query(Chat).join(ChatParticipant).filter(
      ChatParticipant.userId.in_([current_user.id, other_user_id])
    ).group_by(Chat.id).having(
      db.func.count(ChatParticipant.userId) == 2
    ).first()

    if not chat:
      # No chat exists yet
      return {
        "chat_id": None,
        "messages": [],
        "total_count": 0,
        "has_more": False
      }

    # Verify both users are in this chat
    participants = db.query(ChatParticipant).filter(
      ChatParticipant.chatId == chat.id
    ).all()
    participant_ids = {p.userId for p in participants}

    if {current_user.id, other_user_id} != participant_ids:
      raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized to access this chat"
      )

    # Get messages with pagination (newest first)
    messages_query = db.query(ChatMessage, User).join(User).filter(
      ChatMessage.chatId == chat.id
    ).order_by(desc(ChatMessage.createdAt))

    total_count = messages_query.count()
    messages = messages_query.offset(offset).limit(limit).all()

    # Format messages
    formatted_messages = []
    for message, user in messages:
      formatted_messages.append({
        "message_id": message.id,
        "sender_id": message.userId,
        "sender_name": user.name,
        "message": message.message,
        "timestamp": message.createdAt.isoformat(),
        "is_own_message": message.userId == current_user.id
      })

    return {
      "chat_id": chat.id,
      "messages": formatted_messages,
      "total_count": total_count,
      "has_more": offset + limit < total_count
    }

  except Exception as e:
    logger.error(f"Error fetching chat history: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch chat history"
    )

@router.get("/contacts")
async def getChatContacts(
  current_user: User = Depends(getCurrentUser),
  db: Session = Depends(getDatabaseSession)
):
  """Get list of users that current user has chatted with"""
  try:
    # Find all chats where current user is a participant
    user_chats = db.query(ChatParticipant).filter(
      ChatParticipant.userId == current_user.id
    ).all()

    contacts = []
    for chat_participant in user_chats:
      # Get the other participant in each chat
      other_participant = db.query(ChatParticipant, User).join(User).filter(
        and_(
          ChatParticipant.chatId == chat_participant.chatId,
          ChatParticipant.userId != current_user.id
        )
      ).first()

      if other_participant:
        participant, user = other_participant

        # Get last message in this chat
        last_message = db.query(ChatMessage).filter(
          ChatMessage.chatId == chat_participant.chatId
        ).order_by(desc(ChatMessage.createdAt)).first()

        # Check if user is online
        is_online = chat_manager.is_user_online(user.id)

        contact_info = {
          "user_id": user.id,
          "name": user.name,
          "email": user.email,
          "is_online": is_online,
          "chat_id": chat_participant.chatId,
          "last_message": {
            "message": last_message.message if last_message else None,
            "timestamp": last_message.createdAt.isoformat() if last_message else None,
            "sender_id": last_message.userId if last_message else None
          } if last_message else None
        }
        contacts.append(contact_info)

    # Sort by last message timestamp (most recent first)
    contacts.sort(
      key=lambda x: x["last_message"]["timestamp"] if x["last_message"] else "",
      reverse=True
    )

    return contacts

  except Exception as e:
    logger.error(f"Error fetching contacts: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch contacts"
    )

@router.get("/users/online")
async def getOnlineUsers(
  current_user: User = Depends(getCurrentUser)
):
  """Get list of currently online users"""
  try:
    online_user_ids = list(chat_manager.user_connections.keys())
    # Remove current user from list
    online_user_ids = [uid for uid in online_user_ids if uid != current_user.id]

    return {
      "online_users": online_user_ids,
      "total_online": len(online_user_ids)
    }

  except Exception as e:
    logger.error(f"Error fetching online users: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch online users"
    )

@router.get("/status/{user_id}")
async def getUserStatus(
  user_id: str,
  current_user: User = Depends(getCurrentUser)
):
  """Get online/offline status of a specific user"""
  try:
    is_online = chat_manager.is_user_online(user_id)

    return {
      "user_id": user_id,
      "is_online": is_online,
      "status": "online" if is_online else "offline"
    }

  except Exception as e:
    logger.error(f"Error fetching user status: {e}")
    raise HTTPException(
      status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
      detail="Failed to fetch user status"
    )
