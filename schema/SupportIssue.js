const mongoose = require("mongoose");

const supportIssueSchema = new mongoose.Schema(
  {
    issue_id: {
      type: String,
      required: true,
      unique: true,
    },

    reference_no: {
      type: String,
      required: true,
      unique: true,
    },

    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    issue_type: {
      type: String,
      required: true,
      enum: [
        "vehicle_damage",
        "billing_issue",
        "service_quality",
        "rider_behaviour",
        "app_issue",
        "other",
      ],
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      default: [],
    },

    booking_id: {
      type: String,
      default: null,
    },

    vehicle_id: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },

    expected_response_time: {
      type: String,
      default: "24 hours",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportIssue", supportIssueSchema);
