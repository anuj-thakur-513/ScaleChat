const { Server } = require("socket.io");
const { pub, sub } = require("./redis");

class SocketService {
  #io;
  constructor() {
    console.log("Socket service init...");
    this.#io = new Server();
  }

  initListeners() {
    const io = this.io;
    console.log("Socket listeners init...");

    io.on("connection", (socket) => {
      console.log(
        `New user connected to the server with socket_id: ${socket.id}`
      );

      // subscribe to MESSAGES on connection
      sub.subscribe("MESSAGES");

      socket.on("send:message", async (message) => {
        // publish msg to redis
        await pub.publish("MESSAGES", message);
      });

      // subscriber event
      sub.on("message", (channel, message) => {
        if (channel === "MESSAGES") {
          console.log(`${socket.id}: ${message}`);
          io.emit("message", message);
        }
      });

      socket.on("disconnect", (reason) => {
        console.log(`Disconnected socket_id: ${socket.id}, reason: ${reason}`);
        // remove the subscriber for the current socket
        sub.unsubscribe("MESSAGES");
        sub.removeAllListeners("message");
      });
    });
  }
  get io() {
    return this.#io;
  }
}

module.exports = SocketService;
