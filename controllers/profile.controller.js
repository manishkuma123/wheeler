
const User = require("../schema/User.model");
const path = require("path");
const fs = require("fs");
const { cloudinary } = require("../utils/cloudinary");
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({
      status: true,
      data: {
        first_name: user.first_name,
        last_name:  user.last_name,
        mobile:     user.mobile,
        email:      user.email,
        profile_image: user.profile_photo || null,
      },
    });
  } catch (error) {
    next(error);
  }
};



const setupProfile = async (req, res, next) => {
  try {
    const user_id = req.user.id;
    const { first_name, last_name } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({
        status: false,
        message: "first_name and last_name are required",
      });
    }

    const nameRegex = /^[a-zA-Z\s'-]{1,50}$/;
    if (!nameRegex.test(first_name) || !nameRegex.test(last_name)) {
      return res.status(400).json({
        status: false,
        message: "Invalid name. Only letters, spaces, hyphens, and apostrophes allowed (max 50 chars)",
      });
    }

    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    const updateData = {
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      profile_complete: true,
    };

    if (req.file) {
      // Delete old Cloudinary image if exists
      if (user.profile_photo) {
        const publicId = user.profile_photo
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
      }
      updateData.profile_photo = req.file.path; // Cloudinary URL
    }

    const updatedUser = await User.findByIdAndUpdate(
      user_id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Profile saved successfully",
      user: {
        user_id: updatedUser._id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        profile_complete: updatedUser.profile_complete,
        ...(updatedUser.profile_photo && {
          profile_photo_url: updatedUser.profile_photo,
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};


const editProfile = async (req, res, next) => {
  try {
    const { first_name, last_name, mobile } = req.body;

    const nameRegex = /^[a-zA-Z\s'-]{1,50}$/;

    if (first_name && !nameRegex.test(first_name)) {
      return res.status(400).json({
        status: false,
        message: "Invalid first_name. Only letters, spaces, hyphens, and apostrophes allowed (max 50 chars)",
      });
    }
    if (last_name && !nameRegex.test(last_name)) {
      return res.status(400).json({
        status: false,
        message: "Invalid last_name. Only letters, spaces, hyphens, and apostrophes allowed (max 50 chars)",
      });
    }
    if (mobile && !/^\d{10}$/.test(mobile)) {
      return res.status(400).json({
        status: false,
        message: "Invalid mobile number. Must be 10 digits",
      });
    }

    const updateData = {};
    if (first_name) updateData.first_name = first_name.trim();
    if (last_name)  updateData.last_name  = last_name.trim();
    if (mobile)     updateData.mobile     = mobile;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid fields provided to update",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    // Duplicate mobile
    if (error.code === 11000) {
      return res.status(409).json({
        status: false,
        message: "Mobile number already in use",
      });
    }
    next(error);
  }
};

const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: false, message: "No image file provided" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Cloudinary URL is in req.file.path (set by multer-storage-cloudinary)
    const cloudinaryUrl = req.file.path;

    user.profile_photo = cloudinaryUrl;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Profile image uploaded successfully",
      data: {
        image_url: cloudinaryUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};


const getNotificationSettings = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("notification_settings");
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Notification settings fetched successfully",
      data: user.notification_settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateNotificationSettings = async (req, res, next) => {
  try {
    const ALLOWED_KEYS = [
      "order_assigned", "order_on_way", "vehicle_picked_up",
      "vehicle_ready", "order_delivering", "vehicle_delivered",
      "booking_reminder", "offers_promotions",
    ];

    // Build only the fields sent in the request body
    const updates = {};
    for (const key of ALLOWED_KEYS) {
      if (typeof req.body[key] === "boolean") {
        updates[`notification_settings.${key}`] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        status: false,
        message: `No valid notification fields provided. Allowed: ${ALLOWED_KEYS.join(", ")}`,
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { returnDocument: "after" }
    );

    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.status(200).json({
      status: true,
      message: "Notification settings updated successfully",
      data: user.notification_settings,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    // Profile photo is now on Cloudinary — no local file cleanup needed.
    // Optionally call cloudinary.uploader.destroy(publicId) here if you store the public_id.

    await User.findByIdAndDelete(req.user.id);

    return res.status(200).json({
      status: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  editProfile,
  uploadProfileImage,
  getNotificationSettings,
  updateNotificationSettings,
  deleteAccount,
    setupProfile,
};