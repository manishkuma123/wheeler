const mongoose = require("mongoose");

const pickupSlotSchema = new mongoose.Schema(
  {
    slot_id: {
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
    time_range: {
      type: String,
      required: true,
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

module.exports = mongoose.model("PickupSlot", pickupSlotSchema);