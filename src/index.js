const express = require("express");
const cors = require("cors");
const path = require("path");
const v1Router = require("./routes/version1.routes");
const cookieParser = require("cookie-parser");
const verifyToken = require("./middlewares/auth.middleware");
const { server, app } = require("./service/socket");
const { consumeMessage } = require("./service/kafka/consumer");
const { startCronJobs } = require("./service/cronjob");
require("dotenv").config();

const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.get("/", verifyToken, (req, res) => {
  res.sendFile(path.resolve("./public/chat/index.html"));
});

app.use("/v1", v1Router);

const init = async () => {
  consumeMessage();
  startCronJobs();
  server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

init();
