const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require('uuid');
require('dotenv').config()
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    methods: ["GET", "POST"],
  },
});
const senders = new Set();
const recievers = new Set();
const mapping = new Map();
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on("recieve",() => {
    recievers.add(socket.id);
    const arr = [...recievers];
    io.emit("new-reciever",{arr});
  })
  socket.on("create-room", (payload) => {
    mapping.set(socket.id,payload.reciever_id);
    mapping.set(payload.reciever_id,socket.id);
  });

  socket.on("offer",payload => {
    console.log("offer exchange",payload);
    io.to(mapping.get(socket.id)).emit('offer',{...payload});
  })
  socket.on("answer",payload => {
    console.log("answer exchange",payload);
    io.to(mapping.get(socket.id)).emit('answer',{...payload});
  })
  socket.on("ice-candidate",payload => {
    console.log("ice candidate exchange",payload);
    io.to(mapping.get(socket.id)).emit("ice-candidate",{...payload});
  })
  socket.on("disconnect",() => {
    console.log("user disconnected");
    if(senders.has(socket.id))
    {
      senders.delete(socket.id);
    }else if(recievers.has(socket.id))
    {
      recievers.delete(socket.id);
    }
  })
});

server.listen(PORT, () => {
  console.log("SERVER IS RUNNING ON PORT :",PORT);
});