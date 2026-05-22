const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, resendOtp } = require("../controllers/auth.controller");
const { otpRateLimiter, resendRateLimiter } = require("../rateLimit.middleware");

router.post("/send-otp", otpRateLimiter, sendOtp);

router.post("/verify-otp", verifyOtp);

router.post("/resend-otp", resendRateLimiter, resendOtp);

module.exports = router;
