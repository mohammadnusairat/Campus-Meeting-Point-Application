import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

// Listen for join messages
socket.on("user-joined", (message) => {
  console.log(message);
});

// Listen for disconnect messages
socket.on("user-left", (message) => {
  console.log(message);
});
