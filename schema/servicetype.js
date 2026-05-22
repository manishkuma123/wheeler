const mongoose = require("mongoose");

const serviceTypeSchema = new mongoose.Schema(
  {
    service_type_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: String,
    description: String,
    icon: String,
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceType", serviceTypeSchema);