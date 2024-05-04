const { KAFKA_MESSAGE_TOPIC } = require("../../utils/constants");
const kafka = require("./client");

let producer = null;

const createProducer = async () => {
  if (producer) return producer;
  try {
    producer = kafka.producer();
    await producer.connect();
  } catch (error) {
    console.log(`Error while connecting Producer: ${error}`);
  }
  return producer;
};

const produceMessage = async (message) => {
  try {
    const producer = await createProducer();
    await producer.send({
      messages: [{ key: `message-${Date.now()}`, value: message }],
      topic: KAFKA_MESSAGE_TOPIC,
    });
  } catch (error) {
    console.log(`Error while producing message: ${error}`);
  }
  return true;
};

module.exports = { createProducer, produceMessage };
