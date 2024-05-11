const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const { io } = require("../../service/socket");
const { getSocketId } = require("../../utils/socketManager");
const prisma = require("../../service/prisma");

const handleSendMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const receiverId = parseInt(req.params.receiverId);
  const senderId = req.user.id;
  // TODO 1: add socket support in order to emit messages
  const receiverSocketId = await getSocketId(receiverId);
  const senderSocketId = await getSocketId(senderId);
  console.log(`receiverSocketId: ${receiverSocketId}`);
  if (receiverSocketId) {
    io.to(receiverSocketId).emit("newMessage", message);
  }
  io.to(senderSocketId).emit("newMessage", message);

  // TODO 2: here we have to dump the data to Kafka and then further add the data to DB
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
