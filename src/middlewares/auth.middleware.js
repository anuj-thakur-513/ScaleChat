const prisma = require("../service/prisma");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const jwt = require("jsonwebtoken");

const verifyToken = asyncHandler(async (req, res, next) => {
  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer", "");

  if (!accessToken) {
    throw new ApiError(401, "Unauthorized Request");
  }

  const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
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
    throw new ApiError(401, "Access Token Expired");
  }

  req.user = user;
  next();
});

module.exports = verifyToken;
