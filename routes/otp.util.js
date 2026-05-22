const { v4: uuidv4 } = require("uuid");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateOtpId = () => {
  return uuidv4().replace(/-/g, "").substring(0, 20);
};


const sendOTP = (mobile, countryCode, otp) => {
  const fullNumber = `${countryCode}${mobile}`;

  if (process.env.NODE_ENV === "development") {

    console.log(`📱 OTP for ${fullNumber}`);
    console.log(`🔑 OTP: ${otp}`);
    console.log(`⏰ Expires in: ${process.env.OTP_EXPIRES_IN || 120} seconds`);
   
  }


  return true;
};


const getOtpExpiry = () => {
  const expiresInSeconds = parseInt(process.env.OTP_EXPIRES_IN) || 120;
  return new Date(Date.now() + expiresInSeconds * 1000);
};

module.exports = { generateOTP, generateOtpId, sendOTP, getOtpExpiry };
