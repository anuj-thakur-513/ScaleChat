const Redis = require("ioredis");
const { REDIS_OPTIONS } = require("../utils/constants");

const pub = new Redis(REDIS_OPTIONS);
const sub = new Redis(REDIS_OPTIONS);

module.exports = {
  pub,
  sub,
};
