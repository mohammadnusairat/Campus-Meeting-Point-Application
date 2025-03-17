import { createServer } from "http";
import { Server } from "socket.io";

import express from "express";
const app = express();
import cors from "cors";

app.use(cors());

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Listen for new client connections
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Broadcast to all clients that a new user has joined
  io.emit("user-joined", `User ${socket.id} has joined`);

  // Handle client disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    io.emit("user-left", `User ${socket.id} has left`);
  });
});

server.listen(3001, () => {
  console.log("Server has been started");
});
