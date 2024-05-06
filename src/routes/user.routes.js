const { Router } = require("express");
const {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
} = require("../controllers/user/userAuth.controller");
const verifyToken = require("../middlewares/auth.middleware");
const {
  handleGetAllUsers,
} = require("../controllers/user/userDetails.controller");

const userRouter = Router();

userRouter.post("/signup", handleUserSignup);
userRouter.post("/login", handleUserLogin);
userRouter.post("/logout", verifyToken, handleUserLogout);

userRouter.get("/all", verifyToken, handleGetAllUsers);

module.exports = userRouter;
