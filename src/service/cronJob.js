const cron = require("node-cron");
const { redis } = require("./redis");

// cron job to clean up expired messages every minute
const startCronJobs = () => {
  cron.schedule("*/1 * * * *", async () => {
    console.log(
      "Running cron job to clean up messages from Redis which are written on DB"
    );
    const keys = await redis.keys("messages:*");
    const now = Date.now();

    for (const key of keys) {
      await redis.zremrangebyscore(key, 0, now);
    }
  });
};

module.exports = { startCronJobs };
