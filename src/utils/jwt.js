const jwt = require("jsonwebtoken");

const generateToken = (user, isAccessToken) => {
  let token;
  if (isAccessToken) {
    token = jwt.sign(
      {
        id: user.id,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
  } else {
    token = jwt.sign(
      {
        id: user.id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
  }

  return token;
};

module.exports = { generateToken };
