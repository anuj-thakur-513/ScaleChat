const express = require("express");
const cors = require("cors");
const path = require("path");
const v1Router = require("./routes/version1.routes");
const cookieParser = require("cookie-parser");
const verifyToken = require("./middlewares/auth.middleware");
require("dotenv").config();

const app = express();

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

module.exports = app;
