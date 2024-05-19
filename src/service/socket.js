const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const { redis, sub } = require("../service/redis");
const { REDIS_MESSAGE_CHANNEL } = require("../utils/constants");
const { getSocketId } = require("../utils/socketManager");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// subscribing to REDIS message channel on server start
sub.subscribe(REDIS_MESSAGE_CHANNEL);
sub.on("message", async (channel, receivedMessage) => {
  if (channel === REDIS_MESSAGE_CHANNEL) {
    const { receiverId, senderId, message } = JSON.parse(receivedMessage);
    const senderSocketId = await getSocketId(senderId);
    const receiverSocketId = await getSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", message);
    }
    io.to(senderSocketId).emit("newMessage", message);
  }
});

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
