const { Server } = require("socket.io");
const { pub, sub } = require("./redis");
const { prismaClient } = require("./prisma");
const { produceMessage } = require("./kafka/producer");

class SocketService {
  #io;
  constructor() {
    console.log("Socket service init...");
    this.#io = new Server();
  }

  initListeners() {
    const io = this.io;
    console.log("Socket listeners init...");

    io.on("connection", async (socket) => {
      console.log(
        `New user connected to the server with socket_id: ${socket.id}`
      );

      // subscribe to MESSAGES on connection
      await sub.subscribe("MESSAGES");

      socket.on("send:message", async (message) => {
        // publish msg to redis
        await pub.publish("MESSAGES", message);
      });

      // subscriber event
      sub.on("message", async (channel, message) => {
        if (channel === "MESSAGES") {
          console.log(`${socket.id}: ${message}`);
          io.emit("message", message);
          //TODO: add these messages into DB via Apache Kafka Service
          await produceMessage(message);
        }
      });

      socket.on("disconnect", async (reason) => {
        console.log(`Disconnected socket_id: ${socket.id}, reason: ${reason}`);
        // remove the subscriber for the current socket
        await sub.unsubscribe("MESSAGES");
        await sub.removeAllListeners("message");
      });
    });
  }
  get io() {
    return this.#io;
  }
}

module.exports = SocketService;
