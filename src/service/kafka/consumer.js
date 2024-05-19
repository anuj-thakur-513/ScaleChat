const { KAFKA_MESSAGE_TOPIC } = require("../../utils/constants");
const kafka = require("./client");
const prisma = require("../../service/prisma");
const generateChatPair = require("../../utils/generateChatPair");

const consumeMessage = async () => {
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_MESSAGE_TOPIC, fromBeginning: true });

  // Buffer to store messages
  const messageBuffer = [];
  const flushInterval = 5 * 60 * 1000;

  // Function to flush messages to the database
  const flushMessages = async () => {
    if (messageBuffer.length === 0) return;

    const messagesToStore = [...messageBuffer];
    console.log(
      `\n\nnumber of messages logging in DB: ${messagesToStore.length}`
    );
    messageBuffer.length = 0; // Clear the buffer

    try {
      await prisma.$transaction(async (prisma) => {
        const chatCache = new Map();

        const messagesData = await Promise.all(
          messagesToStore.map(async (msg) => {
            const { senderId, receiverId, receivedMessage, createdAt } = msg;
            const chatPair = generateChatPair(senderId, receiverId);

            let chat = chatCache.get(chatPair);
            if (!chat) {
              chat = await prisma.chat.findFirst({
                where: { participants: { hasEvery: [senderId, receiverId] } },
              });

              if (!chat) {
                chat = await prisma.chat.create({
                  data: {
                    participants: [senderId, receiverId],
                  },
                });
              }

              chatCache.set(chatPair, chat);
            }

            return {
              senderId,
              receiverId,
              message: receivedMessage,
              createdAt,
              chatId: chat.id,
            };
          })
        );

        // Batch insert messages
        await prisma.message.createMany({
          data: messagesData.map(
            ({ senderId, receiverId, message, createdAt }) => ({
              senderId,
              receiverId,
              message,
              createdAt,
            })
          ),
        });

        // Fetch the inserted messages with their IDs
        const insertedMessages = await prisma.message.findMany({
          where: {
            OR: messagesData.map(({ senderId, receiverId, createdAt }) => ({
              senderId,
              receiverId,
              createdAt,
            })),
          },
          select: {
            id: true,
            senderId: true,
            receiverId: true,
          },
        });

        // Update chat records with message IDs
        const chatUpdates = insertedMessages.map(
          async ({ id, senderId, receiverId }) => {
            const chatPair = generateChatPair(senderId, receiverId);
            const chat = chatCache.get(chatPair);
            if (chat) {
              await prisma.chat.update({
                where: { id: chat.id },
                data: {
                  messages: { push: id },
                },
              });
            }
          }
        );

        await Promise.all(chatUpdates).then(
          "messages and chats updated to DB successfully"
        );
      });
    } catch (error) {
      console.error("Error while flushing messages to the database: ", error);
    }
  };

  // Periodically flush messages
  setInterval(flushMessages, flushInterval);

  try {
    await consumer.run({
      autoCommit: true,
      autoCommitInterval: 5 * 60 * 1000, // 5 minutes
      eachMessage: async ({ message }) => {
        const { senderId, receiverId, receivedMessage, createdAt } = JSON.parse(
          message.value.toString()
        );

        // Add the message to the buffer
        messageBuffer.push({
          senderId,
          receiverId,
          receivedMessage,
          createdAt,
        });
      },
    });
  } catch (error) {
    console.log(
      `Error while consuming messages: ${error}\n Retrying after 1 Minute`
    );
    consumer.pause([{ topic: KAFKA_MESSAGE_TOPIC }]);
    setTimeout(() => {
      consumer.resume([{ topic: KAFKA_MESSAGE_TOPIC }]);
    }, 60 * 1000);
  }
};

module.exports = { consumeMessage };
