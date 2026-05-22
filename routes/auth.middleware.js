const { verifyAccessToken } = require("./jwt.util");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        message: "Access denied. No token provided",
      });
    }
console.log("AUTH HEADER:", req.headers.authorization);

const token = req.headers.authorization?.split(" ")[1];

console.log("TOKEN:", token);

const decoded = verifyAccessToken(token);

console.log("DECODED:", decoded);

req.user = decoded;
    // const token = authHeader.split(" ")[1];
    // const decoded = verifyAccessToken(token);
    // req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "Token expired. Please refresh your token",
      });
    }
    return res.status(401).json({
      status: false,
      message: "Invalid token",
    });
  }
};

module.exports = { protect };
