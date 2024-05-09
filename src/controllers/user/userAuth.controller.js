const prisma = require("../../service/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const { generateToken } = require("../../utils/jwt");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const { hashPassword, comparePassword } = require("../../utils/bcrypt");
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
    .cookie("userId", user.id, AUTH_COOKIE_OPTIONS)
    .cookie("accessToken", generatedAccessToken, AUTH_COOKIE_OPTIONS)
    .cookie("refreshToken", generatedRefreshToken, AUTH_COOKIE_OPTIONS)
    .json(new ApiResponse(201, { user: user }, "user created successfully"));
});

const handleUserLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  if ([username, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Username and Password are required fields");
  }

  const existingUser = await prisma.user.findUnique({
    where: { username: username },
  });

  if (!existingUser) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordMatched = await comparePassword(
    password,
    existingUser.password
  );

  if (!isPasswordMatched) {
    throw new ApiError(401, "Incorrect Password");
  }

  const { generatedAccessToken, generatedRefreshToken } = await generateTokens(
    existingUser.id
  );

  return res
    .status(200)
    .cookie("userId", existingUser.id, AUTH_COOKIE_OPTIONS)
    .cookie("accessToken", generatedAccessToken, AUTH_COOKIE_OPTIONS)
    .cookie("refreshToken", generatedRefreshToken, AUTH_COOKIE_OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            id: existingUser.id,
            username: existingUser.username,
            createdAt: existingUser.createdAt,
            updatedAt: existingUser.updatedAt,
          },
        },
        "Logged In Successfully"
      )
    );
});

const handleUserLogout = asyncHandler(async (req, res) => {
  const user = req.user;
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: "" },
  });

  return res
    .status(200)
    .clearCookie("userId", AUTH_COOKIE_OPTIONS)
    .clearCookie("accessToken", AUTH_COOKIE_OPTIONS)
    .clearCookie("refreshToken", AUTH_COOKIE_OPTIONS)
    .json(new ApiResponse(200, {}, "Logged Out Successfully"));
});

module.exports = { handleUserSignup, handleUserLogin, handleUserLogout };
