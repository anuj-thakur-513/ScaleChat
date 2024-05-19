const Redis = require("ioredis");
const { REDIS_OPTIONS } = require("../config/redis.config");

const pub = new Redis(REDIS_OPTIONS);
const sub = new Redis(REDIS_OPTIONS);
const redis = new Redis(REDIS_OPTIONS);

const generateMessageKey = (senderId, receiverId) => {
  // sort IDs for storing data in Redis
  const primaryId = senderId < receiverId ? senderId : receiverId;
  const secondaryId = senderId < receiverId ? receiverId : senderId;

  return `messages:${primaryId}:${secondaryId}`;
};

module.exports = {
  pub,
  sub,
  redis,
  generateMessageKey,
};
