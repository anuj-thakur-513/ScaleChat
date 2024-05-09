const path = require("path");
const prisma = require("../service/prisma");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const verifyToken = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!accessToken) {
    return res.status(401).sendFile(path.resolve("./public/auth/index.html"));
  }
  // required for static page loading -> not required when using a full fledged front-end
  let decodedToken;
  try {
    decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  } catch (error) {
    return res.status(401).sendFile(path.resolve("./public/auth/index.html"));
  }

  const user = await prisma.user.findUnique({
    where: { id: decodedToken.id },
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
      password: false,
      refreshToken: false,
    },
  });

  if (!user) {
    return res.status(401).sendFile(path.resolve("./public/auth/index.html"));
  }

  req.user = user;
  next();
});

module.exports = verifyToken;
