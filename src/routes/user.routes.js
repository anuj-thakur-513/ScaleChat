const { Router } = require("express");
const {
  handleUserSignup,
  handleUserLogin,
  handleUserLogout,
} = require("../controllers/user/user.controller");
const verifyToken = require("../middlewares/auth.middleware");

const authRouter = Router();

authRouter.post("/signup", handleUserSignup);
authRouter.post("/login", handleUserLogin);
authRouter.post("/logout", verifyToken, handleUserLogout);

module.exports = authRouter;
