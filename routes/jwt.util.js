const jwt = require("jsonwebtoken");


const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET);
};


const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET);
};


const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};


const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
