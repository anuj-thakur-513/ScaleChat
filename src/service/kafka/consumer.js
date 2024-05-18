const { KAFKA_MESSAGE_TOPIC } = require("../../utils/constants");
const kafka = require("./client");
const prisma = require("../../service/prisma");

const consumeMessage = async () => {
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_MESSAGE_TOPIC, fromBeginning: true });

  // Buffer to store messages
  const messageBuffer = [];
  const flushInterval = 10 * 60 * 1000; // 10 minutes

  // Function to flush messages to the database
  const flushMessages = async () => {
    if (messageBuffer.length === 0) return;

    const messagesToStore = [...messageBuffer];
    console.log(messagesToStore);
    messageBuffer.length = 0; // Clear the buffer

    try {
      for (const msg of messagesToStore) {
        const { senderId, receiverId, receivedMessage, createdAt } = msg;

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
            message: receivedMessage,
            createdAt: createdAt,
          },
        });

        await prisma.chat.update({
          where: { id: chat.id },
          data: {
            messages: { push: messageEntry.id },
          },
        });
      }
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
