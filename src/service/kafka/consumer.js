const { KAFKA_MESSAGE_TOPIC } = require("../../utils/constants");
const kafka = require("./client");

const consumeMessage = async () => {
  const consumer = kafka.consumer({ groupId: "default" });
  await consumer.connect();
  await consumer.subscribe({ topic: KAFKA_MESSAGE_TOPIC, fromBeginning: true });

  try {
    await consumer.run({
      autoCommit: true,
      autoCommitInterval: 60 * 1000, // 1 minute
      eachMessage: async ({ message }) => {
        console.log({
          key: message.key.toString(),
          value: message.value.toString(),
          headers: message.headers,
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
