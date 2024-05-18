const { Kafka } = require("kafkajs");
const { KAFKA_OPTIONS } = require("../../config/kafka.config");

const kafka = new Kafka(KAFKA_OPTIONS);

module.exports = kafka;
