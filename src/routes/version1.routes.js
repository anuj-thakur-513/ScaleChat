const { Router } = require("express");
const authRouter = require("./user.routes");

const v1Router = Router();

v1Router.use("/user", authRouter);

module.exports = v1Router;
