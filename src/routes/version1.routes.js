const { Router } = require("express");
const userRouter = require("./user.routes");
const messageRouter = require("./message.routes");

const v1Router = Router();

v1Router.use("/user", userRouter);
v1Router.use("/messages", messageRouter);

module.exports = v1Router;
