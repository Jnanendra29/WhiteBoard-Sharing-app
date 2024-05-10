import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import { addUser, getUser, removeUser } from "./utils/users";

// Load environmental variables from .env files
dotenv.config();

// Initiate express app and http server
const app = express();
const server = http.createServer(app);

// Initialize socket.io
const io = new SocketIOServer(server);

// routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to white board backend" });
});

let roomIdGlobal: any, imgURLGlobal: any;

// whenever a user connects
io.on("connection", (socket) => {
  socket.on("userJoined", (data) => {
    const { name, userId, roomId, host, presenter } = data;
    roomIdGlobal = roomId;
    socket.join(roomId);
    const users = addUser({
      name,
      userId,
      roomId,
      host,
      presenter,
      socketId: socket.id,
    });
    socket.emit("userIsJoined", { success: true, users });
    socket.broadcast.to(roomId).emit("userJoinedMessageBroadcasted", name);
    socket.broadcast.to(roomId).emit("allUsers", users);
    socket.broadcast.to(roomId).emit("whiteBoardDataResponse", {
      imgURL: imgURLGlobal,
    });
  });

  socket.on("whiteboardData", (data) => {
    imgURLGlobal = data;
    socket.broadcast.to(roomIdGlobal).emit("whiteBoardDataResponse", {
      imgURL: data,
    });
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    if (user) {
      const removedUser = removeUser(socket.id);
      
      socket.broadcast
        .to(roomIdGlobal)
        .emit("userLeftMessageBroadcasted", user.name);
    }
  });
});

const port = process.env.PORT || 8060;
server.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
