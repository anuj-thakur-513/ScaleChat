const express = require("express");
const cors = require("cors");
const path = require("path");
const v1Router = require("./routes/version1.routes");
const cookieParser = require("cookie-parser");
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
app.use(express.static(path.resolve("./public")));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.sendFile("/public/index.html");
});

app.use("/v1", v1Router);

module.exports = app;
