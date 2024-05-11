const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const { pub } = require("../../service/redis");
const prisma = require("../../service/prisma");
const { REDIS_MESSAGE_CHANNEL } = require("../../utils/constants");

const handleSendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const receiverId = parseInt(req.params.receiverId);
  const senderId = req.user.id;

  await pub.publish(
    REDIS_MESSAGE_CHANNEL,
    JSON.stringify({ receiverId, senderId, message })
  );

  // TODO2: here we have to dump the data to Kafka and then further add the data to DB
  let chat = await prisma.chat.findFirst({
    where: { participants: { hasEvery: [senderId, receiverId] } },
  });

  if (!chat) {
    chat = await prisma.chat.create({
      data: {
        participants: [senderId, receiverId],
      },
    });
  }

  const messageEntry = await prisma.message.create({
    data: {
      senderId: senderId,
      receiverId: receiverId,
      message: message,
    },
  });

  await prisma.chat.update({
    where: { id: chat.id },
    data: {
      messages: { push: messageEntry.id },
    },
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { message: messageEntry },
        "Message added to DB successfully"
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
