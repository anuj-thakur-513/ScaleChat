require("dotenv").config();

const KAFKA_OPTIONS = {
  brokers: [`${process.env.LOCAL_HOST}:9092`],
  clientId: "scalable-chat-server",
};

module.exports = { KAFKA_OPTIONS };
