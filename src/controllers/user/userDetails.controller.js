const prisma = require("../../service/prisma");
const asyncHandler = require("../../utils/asyncHandler");
const ApiResponse = require("../../utils/ApiResponse");
const ApiError = require("../../utils/ApiError");

const handleGetAllUsers = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  const users = await prisma.user.findMany({
    where: { id: { not: currentUser.id } },
    select: { id: true, username: true, createdAt: true },
  });

  if (!users) {
    throw new ApiError(500, "Server Error, retry after some time");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { users: users }, "Successfully fetched users"));
});

module.exports = { handleGetAllUsers };
