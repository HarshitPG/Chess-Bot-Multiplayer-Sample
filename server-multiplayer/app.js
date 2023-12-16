const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const gameLogic = require("./game-logic");
const cors = require("cors");

const app = express();

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (client) => {
  gameLogic.initializeGame(io, client);
});

server.listen(process.env.PORT || 8000, () => {
  console.log("Server Running");
});
