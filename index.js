const express = require("express");
var http = require("http");
const app = express();
const port = process.env.PORT || 5000;
var server = http.createServer(app);
const io = require("socket.io")(server);


//middlewre
app.use(express.json());


io.on("connection", (socket) => {
  console.log("connetetd");
  console.log(socket.id, "has joined");

  socket.on("message", (msg) => {
    console.log(msg);
    socket.broadcast.emit("message", msg);
  });

  socket.on("disconnect", (m) => {
    console.log(`Disconncted ${socket.id}`)
  })



  // Create a new room.
  socket.on('create room', async (roomID) => {
    console.log(`Room Creation ${roomID}`);
    await socket.join(roomID); // Join the room

    const clients = io.sockets.adapter.rooms.get(roomID);
    //to get the number of clients in this room
    const numClients = clients ? clients.size : 0;

    await io.sockets.in(roomID).emit('room members', `Room ${roomID} Created by ${socket.id} totalCount : ${numClients}`);
  });

  // Join an existing room.
  socket.on('join room', async (roomID) => {
    const clients = io.sockets.adapter.rooms.get(roomID);
    //to get the number of clients in this room
    const numClients = clients ? clients.size : 0;

    if (numClients) {
      await socket.join(roomID);
      //this is an ES6 Set of all client ids in the room
      let newclients = io.sockets.adapter.rooms.get(roomID);
      //to get the number of clients in this room
      let  numNewclients = newclients ? newclients.size : 0;
      await io.sockets.in(roomID).emit('room members', `Room ${roomID} joined by ${socket.id} totalCount : ${numNewclients}`);
    } else {
      socket.emit('room members', `No Such Room Exists`);
    }

  });

  socket.on('new_message_to_room', async ({roomID, message}) =>{
    await io.sockets.in(roomID).emit('new_message_in_room', { sender: socket.id , roomID: roomID , message: message });
  })


  // Handle other events...

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });


});

server.listen(port, "0.0.0.0", () => {
  console.log("server started");
});