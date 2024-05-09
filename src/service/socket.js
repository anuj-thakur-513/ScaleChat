const { Server } = require("socket.io");
const http = require("http");
const app = require("../app");
const { redis } = require("../service/redis");

const server = http.createServer(app);
const io = new Server(server);

const getSocketId = async (userId) => {
  return await redis.get(`userSocketMap:${userId}`);
};

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
  console.log(userId);

  socket.on("disconnect", async () => {
    console.log("user disconnected", socket.id);
    await redis.del(`userSocketMap:${userId}`);
  });
});

module.exports = { server, io, getSocketId };
