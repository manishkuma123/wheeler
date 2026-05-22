const express   = require("express");
const router    = express.Router();
const { protect }       = require("./auth.middleware");
const { profileUpload } = require("../utils/cloudinary");
const {
  getProfile,
  setupProfile,
  editProfile,
  uploadProfileImage,
  getNotificationSettings,
  updateNotificationSettings,
  deleteAccount,
} = require("../controllers/profile.controller");

router.get   ("/profile",               protect, getProfile);
router.post  ("/setup-profile",         protect, profileUpload.single("image"), setupProfile);
router.put   ("/profile",               protect, editProfile);
router.post  ("/profile-image",         protect, profileUpload.single("image"), uploadProfileImage);
router.get   ("/notification-settings", protect, getNotificationSettings);
router.post  ("/notification-settings", protect, updateNotificationSettings);
router.delete("/account",               protect, deleteAccount);

module.exports = router;