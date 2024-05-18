const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const { pub } = require("../../service/redis");
const prisma = require("../../service/prisma");
const { REDIS_MESSAGE_CHANNEL } = require("../../utils/constants");
const { produceMessage } = require("../../service/kafka/producer");

const handleSendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const receiverId = parseInt(req.params.receiverId);
  const senderId = req.user.id;

  await pub.publish(
    REDIS_MESSAGE_CHANNEL,
    JSON.stringify({ receiverId, senderId, message })
  );

  // get current time in order to get createdAt field for DB
  const currentDate = new Date();
  const isoString = currentDate.toISOString();
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
        { senderId: senderId, receiverId: receiverId, message: message },
        "Message produced to Kafka Broker successfully"
      )
    );
});

const handleGetMessages = asyncHandler(async (req, res) => {
  const { receiverId } = req.params.receiverId;
  const senderId = req.user.id;

  const chat = await prisma.chat.findUnique({
    where: { participants: { hasEvery: [receiverId, senderId] } },
  });

  if (!chat) {
    return res.status(404).json(new ApiResponse(404, {}, "no chat found"));
  }

  const messages = await prisma.message.findMany({
    where: { id: { in: chat.messages } },
    orderBy: { id: "desc" },
    select: {
      senderId: true,
      receiverId: true,
      message: true,
      createdAt: true,
    },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { messages: messages },
        "messages fetched successfully"
      )
    );
});

module.exports = { handleSendMessage, handleGetMessages };
