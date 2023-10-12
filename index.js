const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());

const rooms = {};
const userList = {};
let lastRoomID = 0; // Initialize with 0 for the first room.

const eventHandlers = {
  'create_room': handleCreateRoom,
  'delete_room':handleDeleteRoom,
  'join_room': handleJoinRoom,
  'send_message': handleSendMessage,
  'disconnect': handleDisconnect,
};

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  socket.emit('lobby_update', getLobbyData());
  socket.emit('getId', socket.id);
  Object.keys(eventHandlers).forEach((eventName) => {
    socket.on(eventName, (data) => {
      eventHandlers[eventName](socket, data);
    });
  });
});

function generateRoomID() {
  lastRoomID += 1; // Increment the room ID.
  return `room_${lastRoomID}`;
}

function handleCreateRoom(socket, data) {
  const roomID = generateRoomID();
  const room = {
    id: roomID,
    name: data.roomName,
    members: [socket.id],
  };

  rooms[roomID] = room;
  socket.join(roomID);
  socket.emit('room_created', room);
  io.emit('lobby_update', getLobbyData());
}


async function handleDeleteRoom(socket, data) {
  console.log(`Delect room called for ${data.roomID}`)
  const room = rooms[data.roomID];
  if (room && room.members.includes(socket.id)) {
    console.log(`Before ${JSON.stringify(rooms)}`)
    delete rooms[data.roomID]; // Delete the room
    console.log(`After ${JSON.stringify(rooms)}`)
    await io.in(data.roomID).socketsLeave(data.roomID);
    socket.emit('room_deleted', data.roomID); // Send a confirmation
    io.emit('lobby_update', getLobbyData()); // Update the lobby
  } else {
    socket.emit('room_not_found', { error: 'Room not found or unauthorized' });
  }
}

function handleJoinRoom(socket, data) {
  const room = rooms[data.roomID];
  if (room) {
    room.members.push(socket.id);
    socket.join(data.roomID);
    socket.emit('joined_room', room);
    io.emit('lobby_update', getLobbyData());
  } else {
    socket.emit('room_not_found', { error: 'Room not found' });
  }
}

function handleSendMessage(socket, data) {
  const room = rooms[data.roomID];
  if (room && room.members.includes(socket.id)) {
    io.to(data.roomID).emit('new_message', {
      sender: socket.id,
      message: data.message,
    });
  }
}

function handleDisconnect(socket) {
  console.log('User disconnected:', socket.id);

  // Handle cleanup or room removal here if needed
}

function getLobbyData() {
  return Object.values(rooms);
}

server.listen(5000, () => {
  console.log('Server started on port 5000');
});
