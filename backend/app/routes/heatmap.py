from fastapi import APIRouter, WebSocket, Depends, HTTPException
from fastapi.responses import HTMLResponse
import time

from ..models import User
from ..auth import getCurrentUser, verifyToken

router = APIRouter(prefix="/heatmap", tags=["heatmap"])

# class HeatmapManager:
#   def __init__(self):
#     self.active_connections: list[WebSocket] = []

#     # TODO: Implement multithread protection
#     self.heatmap_data: dict = {}
#     self.user_last_location: dict = {}

#   async def connect(self, websocket: WebSocket):
#     await websocket.accept()
#     self.active_connections.append(websocket)
#     # Send initial heatmap data
#     await websocket.send_json(self.heatmap_data)

#   async def disconnect(self, websocket: WebSocket):
#     self.active_connections.remove(websocket)

#   async def broadcast_heatmap(self):
#     for connection in self.active_connections:
#       await connection.send_json(self.heatmap_data)

#   def update_heatmap(self, user_id: str, lat: float, lng: float):
#     # Check if user has moved
#     if user_id in self.user_last_location:
#       lat, lng = self.user_last_location[user_id]
#       self.heatmap_data[(lat,lng)] -= 1
#       if self.heatmap_data[(lat,lng)] == 0:
#         del self.heatmap_data[(lat,lng)]

#     # Update heatmap data
#     self.heatmap_data[(lat,lng)] = self.heatmap_data.get((lat,lng), 0) + 1
#     self.user_last_location[user_id] = (lat, lng)

# heatmap_manager = HeatmapManager()

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

# @router.websocket("/ws")
# async def getHeatmap(
#   websocket: WebSocket,
#   ):
#   token = websocket.headers.get("sec-websocket-protocol")
#   userId = verifyToken(token)
#   if not userId:
#     await websocket.close(code=1008, reason="Invalid token")
#     return
#   await websocket.accept()

#   await websocket.send_text("Hello")
#   while True:
#     data = await websocket.receive_json()
#     print(data)

#   #   try:
#   #     data = await websocket.receive_json()
#   #     print(data)
#   # #     print(data)
#   # #     # Check data has correct attributes
#   # #     lat = float(data.get("lat"))
#   # #     lng = float(data.get("lng"))
#   # #     # Update heatmap data
#   # #     heatmap_manager.update_heatmap(userId, lat, lng)
#   # #     await heatmap_manager.broadcast_heatmap()
#   #   except Exception as e:
#   #     print(e)
#   #     break
#   await websocket.close()

html = """
<!DOCTYPE html>
<html>
    <head>
        <title>Chat</title>
    </head>
    <body>
        <h1>WebSocket Chat</h1>
        <form onsubmit="login(event)">
            <input type="text" name="email" id="email" placeholder="Email" autocomplete="off"/>
            <input type="text" name="password" id="password" placeholder="Password" autocomplete="off"/>
            <button>Login</button>
        </form>
        <form action="" onsubmit="sendMessage(event)">
            <input type="text" id="messageText" autocomplete="off"/>
            <button>Send</button>
        </form>
        <ul id='messages'>
        </ul>
        <script>
            function login(event) {
              event.preventDefault();
              var email = document.getElementById("email").value;
              var password = document.getElementById("password").value;
              response = fetch("/auth/login", {
                  method: "POST",
                  body: JSON.stringify({email: email, password: password}),
                  headers: {
                      "Content-Type": "application/json"
                  }
              }).then(response => response.json()).then(data => {
                establishConnection(data.token);
              }).catch(error => {
                  console.error("Login failed");
              });
              console.log("Login successful");
            }
            var ws = null;

            function establishConnection(token) {
              console.log(token)
              ws = new WebSocket("ws://localhost:8000/heatmap/ws", [token]);
              ws.onmessage = function(event) {
                  var messages = document.getElementById('messages')
                  var message = document.createElement('li')
                  var content = document.createTextNode(event.data)
                  message.appendChild(content)
                  messages.appendChild(message)
              };
            }

            function sendMessage(event) {
                var input = document.getElementById("messageText")
                ws.send(input.value)
                input.value = ''
                event.preventDefault()
            }
        </script>
    </body>
</html>
"""


@router.get("/")
async def get():
  return HTMLResponse(html)


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
  token = websocket.headers.get("sec-websocket-protocol")

  await websocket.accept(subprotocol=token)
  while True:
      data = await websocket.receive_text()
      await websocket.send_text(f"Message text was: {data}")