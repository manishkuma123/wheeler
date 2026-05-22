const Otp = require("../schema/Otp.model");
const User = require("../schema/User.model");
const { generateOTP, generateOtpId, sendOTP, getOtpExpiry } = require("../routes/otp.util");
const { generateAccessToken, generateRefreshToken } = require("../routes/jwt.util");

const MAX_OTP_ATTEMPTS = 5;

const sendOtp = async (req, res, next) => {
  try {
    const { mobile, country_code = "+91" } = req.body;

    if (!mobile) {
      return res.status(400).json({
        status: false,
        message: "Mobile number is required",
      });
    }

    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) {
      return res.status(400).json({
        status: false,
        message: "Invalid mobile number. Must be 10 digits",
      });
    }

    
    await Otp.deleteMany({ mobile, is_verified: false });

    const otp = generateOTP();
    const otp_id = generateOtpId();
    const expires_at = getOtpExpiry();

    await Otp.create({
      otp_id,
      mobile,
      country_code,
      otp,
      expires_at,
    });

   
    sendOTP(mobile, country_code, otp);

    const expiresInSeconds = parseInt(process.env.OTP_EXPIRES_IN) || 120;

    return res.status(200).json({
      status: true,
      message: "OTP sent successfully",
      otp_id,
      expires_in: expiresInSeconds,
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { otp_id, otp, mobile } = req.body;

    if (!otp_id || !otp || !mobile) {
      return res.status(400).json({
        status: false,
        message: "otp_id, otp, and mobile are required",
      });
    }

    // Find OTP record
    const otpRecord = await Otp.findOne({ otp_id, mobile });

    if (!otpRecord) {
      return res.status(400).json({
        status: false,
        message: "Invalid OTP session. Please request a new OTP",
      });
    }

    // Check if already verified
    if (otpRecord.is_verified) {
      return res.status(400).json({
        status: false,
        message: "OTP already used. Please request a new OTP",
      });
    }

    // Check expiry
    if (new Date() > otpRecord.expires_at) {
      await Otp.deleteOne({ otp_id });
      return res.status(400).json({
        status: false,
        message: "OTP has expired. Please request a new OTP",
      });
    }

    // Check max attempts
    if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
      await Otp.deleteOne({ otp_id });
      return res.status(429).json({
        status: false,
        message: "Too many failed attempts. Please request a new OTP",
      });
    }

    // Validate OTP
    if (otpRecord.otp !== otp) {
      await Otp.updateOne({ otp_id }, { $inc: { attempts: 1 } });
      const remainingAttempts = MAX_OTP_ATTEMPTS - otpRecord.attempts - 1;
      return res.status(400).json({
        status: false,
        message: `Invalid OTP. ${remainingAttempts} attempt(s) remaining`,
      });
    }

    // Mark OTP as verified
    await Otp.updateOne({ otp_id }, { is_verified: true });

    // Check if user exists
    let user = await User.findOne({ mobile });
    let is_new_user = false;

    if (!user) {
      is_new_user = true;
      const { v4: uuidv4 } = require("uuid");
      user = await User.create({
        user_id: `usr_${uuidv4().replace(/-/g, "").substring(0, 10)}`,
        mobile,
        country_code: otpRecord.country_code,
      });
    }

    // Update last login
    await User.updateOne({ mobile }, { last_login: new Date() });

    // Generate tokens
    const tokenPayload = { id: user._id, mobile: user.mobile };
    const access_token = generateAccessToken(tokenPayload);
    const refresh_token = generateRefreshToken(tokenPayload);

    return res.status(200).json({
      status: true,
      message: "OTP verified successfully",
      is_new_user,
      access_token,
      refresh_token,
      user: {
       id: user._id,
        mobile: user.mobile,
        profile_complete: user.profile_complete,
      },
    });
  } catch (error) {
    next(error);
  }
};


const resendOtp = async (req, res, next) => {
  try {
    const { otp_id, mobile } = req.body;

    if (!otp_id || !mobile) {
      return res.status(400).json({
        status: false,
        message: "otp_id and mobile are required",
      });
    }

    // Find existing OTP record
    const existingOtp = await Otp.findOne({ otp_id, mobile });

    if (!existingOtp) {
      return res.status(400).json({
        status: false,
        message: "Invalid OTP session. Please request a new OTP",
      });
    }

    if (existingOtp.is_verified) {
      return res.status(400).json({
        status: false,
        message: "OTP already verified",
      });
    }

    // Delete the old OTP record
    await Otp.deleteOne({ otp_id });

    // Generate fresh OTP
    const newOtp = generateOTP();
    const new_otp_id = generateOtpId();
    const expires_at = getOtpExpiry();

    await Otp.create({
      otp_id: new_otp_id,
      mobile,
      country_code: existingOtp.country_code,
      otp: newOtp,
      expires_at,
    });

    // Send new OTP (console log in dev)
    sendOTP(mobile, existingOtp.country_code, newOtp);

    const expiresInSeconds = parseInt(process.env.OTP_EXPIRES_IN) || 120;

    return res.status(200).json({
      status: true,
      message: "OTP resent successfully",
      otp_id: new_otp_id,
      expires_in: expiresInSeconds,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendOtp, verifyOtp, resendOtp };
