const rateLimit = require("express-rate-limit");

const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: "Too many OTP requests. Please try again after 15 minutes",
  },
});

const resendRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: false,
    message: "Too many resend requests. Please try again after 10 minutes",
  },
});

module.exports = { otpRateLimiter, resendRateLimiter };
