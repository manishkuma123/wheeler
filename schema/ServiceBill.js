const mongoose = require("mongoose");

const serviceBillSchema = new mongoose.Schema(
  {
    bill_id: {
      type:     String,
      required: true,
      unique:   true,
    },

    booking_id: {
      type:     String,
      required: true,
    },

    user_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
    },

    file_name: {
      type:    String,
      default: null,
    },

    file_url: {
      type:     String,
      required: true,
    },

    cloudinary_public_id: {
      type:    String,
      default: null,
    },

    file_size_bytes: {
      type:    Number,
      default: 0,
    },

    resource_type: {
      type:    String,
      default: "image",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceBill", serviceBillSchema);
