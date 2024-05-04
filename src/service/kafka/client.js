const { Kafka } = require("kafkajs");
require("dotenv").config();

const kafka = new Kafka({
  brokers: [`${process.env.LOCAL_HOST}:9092`],
  clientId: "scalable-chat-server",
});

module.exports = kafka;
