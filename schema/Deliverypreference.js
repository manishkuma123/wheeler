const mongoose = require("mongoose");

const deliveryPreferenceSchema = new mongoose.Schema(
  {
    pref_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    sort_order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliveryPreference", deliveryPreferenceSchema);