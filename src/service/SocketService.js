const { Server } = require("socket.io");

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
        console.log(`new message received: ${message}`);
      });

      socket.on("disconnect", () => {
        console.log(`socket_id: ${socket.id} disconnected`);
      });
    });
  }
  get io() {
    return this.#io;
  }
}

module.exports = SocketService;
