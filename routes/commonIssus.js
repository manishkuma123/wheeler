const express = require("express");
const router = express.Router();

const CommonIssue = require("../schema/commonIssue");
const {protect}= require("./auth.middleware");


router.get("/common-issues", protect, async (req, res) => {
  try {
    const { service_type_id } = req.query;

    if (!service_type_id) {
      return res.status(400).json({
        status: false,
        message: "service_type_id is required",
      });
    }

    const issues = await CommonIssue.find({
      service_type_id,
      is_active: true,
    }).select("-_id issue_id label");

    return res.json({
      status: true,
      data: issues,
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