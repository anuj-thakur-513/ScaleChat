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

      socket.on("event:message", (message) => {
        console.log(`message received from ${socket.id}: ${message}`);
        io.emit("event:message", message);
      });

      socket.on("disconnect", () => {
        console.log(`Disconnected user with socket_id: ${socket.id}`);
      });
    });
  }
  get io() {
    return this.#io;
  }
}

module.exports = SocketService;
