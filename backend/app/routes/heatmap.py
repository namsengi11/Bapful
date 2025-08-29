from fastapi import APIRouter, WebSocket, Depends, HTTPException
from fastapi.responses import HTMLResponse
import time

from ..models import User
from ..auth import getCurrentUser, verifyToken

router = APIRouter(prefix="/heatmap", tags=["heatmap"])

class HeatmapManager:
  def __init__(self):
    self.active_connections: list[WebSocket] = []

    # TODO: Move to Redis
    self.heatmap_data: dict = {
      (37.5665, 126.9780): 50,
      (39.1234, 125.1234): 50,
      (30.5665, 124.9780): 50,
    }
    # Dummy data
    self.user_last_location: dict = {
      "user_23d1120a": (37.5665, 126.9780),
      "user_26458a78": (39.1234, 125.1234),
    }

  async def connect(self, websocket: WebSocket):
    token = websocket.headers.get("sec-websocket-protocol")
    userId = verifyToken(token)
    if not userId:
      await websocket.close(code=1008, reason="Invalid token")
      return
    await websocket.accept(subprotocol=token)
    self.active_connections.append(websocket)
    # Send initial heatmap data
    await websocket.send_json(list(self.heatmap_data.items()))
    while True:
      try:
        data = await websocket.receive_json()
        # Check data has correct attributes
        lat = float(data.get("lat"))
        lng = float(data.get("lng"))
        # Update heatmap data
        self.update_heatmap(userId, lat, lng)
        await self.broadcast_heatmap()
      except Exception as e:
        print(e)
        break
    await self.disconnect(websocket)

  async def disconnect(self, websocket: WebSocket):
    self.active_connections.remove(websocket)
    await websocket.close()

  async def broadcast_heatmap(self):
    print(self.active_connections)
    for connection in self.active_connections:
      print(connection)
      await connection.send_json(list(self.heatmap_data.items()))

  def update_heatmap(self, user_id: str, lat: float, lng: float):
    # Check if user has moved
    if user_id in self.user_last_location:
      prev_lat, prev_lng = self.user_last_location[user_id]
      if (prev_lat, prev_lng) in self.heatmap_data:
        self.heatmap_data[(prev_lat, prev_lng)] -= 1

    # Update heatmap data
    self.heatmap_data[(lat,lng)] = self.heatmap_data.get((lat,lng), 0) + 1
    self.user_last_location[user_id] = (lat, lng)

heatmap_manager = HeatmapManager()

@router.websocket("/ws")
async def getHeatmap(
  websocket: WebSocket,
  ):
  await heatmap_manager.connect(websocket)

# websocket test code
# html = """
# <!DOCTYPE html>
# <html>
#     <head>
#         <title>Chat</title>
#     </head>
#     <body>
#         <h1>WebSocket Chat</h1>

#         <form onsubmit="login(event)">
#             <input type="text" name="email" id="email" placeholder="Email" autocomplete="off"/>
#             <input type="text" name="password" id="password" placeholder="Password" autocomplete="off"/>
#             <button>Login</button>
#         </form>

#         <form action="" onsubmit="sendMessage(event)">
#             <input type="text" id="lat" placeholder="Latitude" autocomplete="off"/>
#             <input type="text" id="lng" placeholder="Longitude" autocomplete="off"/>
#             <button>Send</button>
#         </form>
#         <ul id='messages'>
#         </ul>
#         <script>
#             var ws = new WebSocket();
#             function login(event) {
#                 event.preventDefault();
#                 var email = document.getElementById("email").value;
#                 var password = document.getElementById("password").value;
#                 response = fetch("/auth/login", {
#                     method: "POST",
#                     body: JSON.stringify({email: email, password: password}),
#                     headers: {
#                         "Content-Type": "application/json"
#                     }
#                 }).then(response => response.json()).then(data => {
#                     token = data.token;
#                     establishConnection(token);
#                 });
#             }

#             function establishConnection(token) {
#                 ws = new WebSocket("ws://localhost:8000/heatmap/ws", [token]);
#                 console.log("Created new socket");
#                 configureWebSocket();
#                 console.log("Configured socket");
#             }

#             function configureWebSocket() {
#               ws.onopen = function() {
#                   console.log("Opened connection");
#               }
#               ws.onmessage = function(event) {
#                   console.log("Message received");
#                   var messages = document.getElementById('messages')
#                   var message = document.createElement('li')
#                   var content = document.createTextNode(event.data)
#                   message.appendChild(content)
#                   messages.appendChild(message)
#               }
#             }

#             function sendMessage(event) {
#                 if (!ws) {
#                     console.log("No connection to server");
#                     return;
#                 }
#                 var input = document.getElementById("lat")
#                 var input2 = document.getElementById("lng")
#                 ws.send(JSON.stringify({
#                     lat: input.value,
#                     lng: input2.value
#                 }))
#                 input.value = ''
#                 input2.value = ''
#                 event.preventDefault()
#             }



#         </script>
#     </body>
# </html>
# """

# @router.get("")
# async def getWSPage():
#   return HTMLResponse(content=html)
