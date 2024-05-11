const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const { redis } = require("../service/redis");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on("connection", async (socket) => {
  console.log(`New user connected to the server with socket_id: ${socket.id}`);
  // set userID and socketID as key value pair on Redis
  const cookies = socket.handshake.headers.cookie.split(";");
  let userId;
  for (const cookie of cookies) {
    const [key, value] = cookie.trim().split("=");
    if (key === "userId") {
      userId = value;
      break;
    }
  }
  await redis.set(`userSocketMap:${userId}`, socket.id);

  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);
    await redis.del(`userSocketMap:${userId}`);
  });
});

module.exports = { server, io, app };
