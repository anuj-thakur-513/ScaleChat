const { KAFKA_MESSAGE_TOPIC } = require("../../utils/constants");
const kafka = require("./client");

const init = async () => {
  try {
    const admin = kafka.admin();
    admin.connect();
    await admin.createTopics({
      topics: [
        {
          topic: KAFKA_MESSAGE_TOPIC,
          numPartitions: 1,
        },
      ],
    });
    await admin.disconnect();
  } catch (error) {
    console.log(`Error creating kafka admin: ${error}`);
  }
};

init();
