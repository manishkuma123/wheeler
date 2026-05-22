const express             = require("express");
const router              = express.Router();
const { protect }         = require("./auth.middleware");
const { serviceBillUpload } = require("../utils/cloudinary");

const {
  saveBooking,
  getHomeDashboard,
  getBookingConfirmation,
  getBookingList,
  getBookingDetails,
  getBookingTracking,
  uploadServiceBill,
} = require("../controllers/bookingController");

// ── Booking CRUD ──────────────────────────────────────────────────────────────
router.post("/save",               protect, saveBooking);
router.get ("/confirmation",       protect, getBookingConfirmation);
router.get ("/bookings-tracking",  protect, getBookingTracking);
router.get ("/home-dashboard",     protect, getHomeDashboard);
router.get ("/bookings",           protect, getBookingList);
router.get ("/bookings-details",   protect, getBookingDetails);

// 7.3 Upload Service Bill
// POST /api/bookings-details/service-bill?booking_id=bk_8829
router.post(
  "/bookings-details/service-bill",
  protect,
  serviceBillUpload.single("file"),
  uploadServiceBill
);

module.exports = router;
