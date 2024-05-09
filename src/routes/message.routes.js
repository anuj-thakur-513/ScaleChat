const { Router } = require("express");
const verifyToken = require("../middlewares/auth.middleware");
const {
  handleSendMessage,
  handleGetMessages,
} = require("../controllers/message/message.controller");

const messageRouter = Router();

messageRouter.post("/:receiverId", verifyToken, handleSendMessage);
messageRouter.get("/:receiverId", verifyToken, handleGetMessages);

module.exports = messageRouter;
