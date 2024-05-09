const Redis = require("ioredis");
const { REDIS_OPTIONS } = require("../config/redis.config");

const pub = new Redis(REDIS_OPTIONS);
const sub = new Redis(REDIS_OPTIONS);
const redis = new Redis(REDIS_OPTIONS);

module.exports = {
  pub,
  sub,
  redis,
};
