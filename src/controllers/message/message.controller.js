const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const { pub, redis, generateMessageKey } = require("../../service/redis");
const prisma = require("../../service/prisma");
const { REDIS_MESSAGE_CHANNEL } = require("../../utils/constants");
const { produceMessage } = require("../../service/kafka/producer");

const handleSendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const receiverId = parseInt(req.params.receiverId);
  const senderId = req.user.id;
  // get current time in order to make createdAt field for DB
  const currentDate = new Date();
  const isoString = currentDate.toISOString();
  const redisKey = generateMessageKey(senderId, receiverId);
  const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes from now

  const redisMessageString = JSON.stringify({
    senderId: senderId,
    receiverId: receiverId,
    message: message,
    createdAt: isoString,
  });

  /**
   * - add message to Redis sorted set with score as expiryTime
   * - storage format
   *  - shorterId
   *    - longerId
   *      - {sender, receiver, message, createdAt}
   */
  await redis.zadd(redisKey, expirationTime, redisMessageString);
  console.log(`message stored in redis and produced to kafka broker`);

  // publishing to REDIS_MESSAGE_CHANNEL
  await pub.publish(REDIS_MESSAGE_CHANNEL, redisMessageString);

  await produceMessage(
    JSON.stringify({
      senderId: senderId,
      receiverId: receiverId,
      receivedMessage: message,
      createdAt: isoString,
    })
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        JSON.parse(messageString),
        "Message produced to Kafka Broker successfully & Added to Redis"
      )
    );
});

const handleGetMessages = asyncHandler(async (req, res) => {
  const receiverId = parseInt(req.params.receiverId);
  const senderId = req.user.id;
  const redisKey = generateMessageKey(senderId, receiverId);
  const now = Date.now();

  // Remove expired messages from Redis
  await redis.zremrangebyscore(redisKey, 0, now);

  // Fetch non-expired messages from Redis
  const redisMessages = await redis.zrangebyscore(redisKey, now, "+inf");
  const parsedRedisMessages = redisMessages
    ? redisMessages.map((msg) => JSON.parse(msg))
    : [];

  const chat = await prisma.chat.findFirst({
    where: { participants: { hasEvery: [receiverId, senderId] } },
  });

  if (!chat && parsedRedisMessages.length === 0) {
    return res.status(404).json(new ApiResponse(404, {}, "no chat found"));
  }

  let dbMessages = [];
  if (chat) {
    dbMessages = await prisma.message.findMany({
      where: { id: { in: chat.messages } },
      orderBy: { id: "desc" },
      select: {
        senderId: true,
        receiverId: true,
        message: true,
        createdAt: true,
      },
    });
  }

  // Combine Redis messages and DB messages -> Sort them in ascending order of createdAt
  const allMessages = [...parsedRedisMessages, ...dbMessages];
  allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { messages: allMessages },
        "messages fetched successfully"
      )
    );
});

module.exports = { handleSendMessage, handleGetMessages };
