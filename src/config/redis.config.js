const REDIS_OPTIONS = {
  host: process.env.AIVEN_REDIS_HOST,
  port: process.env.AIVEN_REDIS_PORT,
  username: process.env.AIVEN_REDIS_USER,
  password: process.env.AIVEN_REDIS_PASSWORD,
};

module.exports = { REDIS_OPTIONS };
