const Redis = require("ioredis");
const { REDIS_OPTIONS } = require("../config/redis.config");
const generateChatPair = require("../utils/generateChatPair");

const pub = new Redis(REDIS_OPTIONS);
const sub = new Redis(REDIS_OPTIONS);
const redis = new Redis(REDIS_OPTIONS);

const generateMessageKey = (senderId, receiverId) => {
  // sort IDs for storing data in Redis
  const chatPair = generateChatPair(senderId, receiverId);
  return `messages:${chatPair}`;
};

module.exports = {
  pub,
  sub,
  redis,
  generateMessageKey,
};
