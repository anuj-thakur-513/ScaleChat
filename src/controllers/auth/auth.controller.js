const prisma = require("../../service/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { generateToken } = require("../../utils/jwt");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const { hashPassword } = require("../../utils/bcrypt");
const { AUTH_COOKIE_OPTIONS } = require("../../config/cookies.config");

// helper method to generate tokens
const generateTokens = async (userId) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const generatedAccessToken = generateToken(userId, true);
    const generatedRefreshToken = generateToken(userId, false);

    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken: generatedRefreshToken,
      },
    });

    return { generatedAccessToken, generatedRefreshToken };
  } catch (error) {
    throw new ApiError(500, "Error while generating Tokens", error);
  }
};

const handleUserSignup = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if ([username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Username and Password are required fields");
  }

  // hash the password
  const hashedPassword = await hashPassword(password);

  const existingUser = await prisma.user.findUnique({
    where: { username: username },
  });

  if (existingUser) {
    throw new ApiError(409, "User with entered username already exists");
  }

  const user = await prisma.user.create({
    data: { username: username, password: hashedPassword, refreshToken: "" },
    select: {
      id: true,
      username: true,
      createdAt: true,
      updatedAt: true,
      password: false,
      refreshToken: false,
    },
  });

  const { generatedAccessToken, generatedRefreshToken } = await generateTokens(
    user.id
  );

  return res
    .status(201)
    .cookie("accessToken", generatedAccessToken, AUTH_COOKIE_OPTIONS)
    .cookie("refreshToken", generatedRefreshToken, AUTH_COOKIE_OPTIONS)
    .json(new ApiResponse(201, { user: user }, "user created successfully"));
});

module.exports = { handleUserSignup };
