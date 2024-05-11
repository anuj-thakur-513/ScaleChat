const { redis } = require("../service/redis");

const getSocketId = async (userId) => {
  const socketId = await redis.get(`userSocketMap:${userId}`);
  return socketId;
};

module.exports = { getSocketId };
