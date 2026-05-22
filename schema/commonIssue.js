const mongoose = require("mongoose");

const commonIssueSchema = new mongoose.Schema(
  {
    issue_id: {
      type: String,
      required: true,
      unique: true,
    },

    service_type_id: {
      type: String,
      required: true,
    },

    label: {
      type: String,
      required: true,
    },

    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommonIssue", commonIssueSchema);