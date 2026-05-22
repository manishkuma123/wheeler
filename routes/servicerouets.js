const express = require("express");
const router = express.Router();

const ServiceType = require("../schema/servicetype");
const {protect} = require("./auth.middleware");
router.get("/", protect, async (req, res) => {
  try {
    const data = await ServiceType.find({ is_active: true }).select(
      "-_id service_type_id title description icon is_active"
    );

    return res.json({
      status: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error",
      error: error.message,
    });
  }
});

module.exports = router;