const mongoose = require("mongoose");

const slotAvailabilitySchema = new mongoose.Schema(
  {
    centre_id: {
      type: String,
      required: true,
      trim: true,
    },
    slot_id: {
      type: String,
      required: true,
      trim: true,
    },
    date: {
      
      type: String,
      required: true,
    },
    is_blocked: {
      type: Boolean,
      default: true,
    },
    reason: {
      
      type: String,
      default: "fully_booked",
    },
  },
  { timestamps: true }
);

slotAvailabilitySchema.index({ centre_id: 1, date: 1 });
slotAvailabilitySchema.index({ centre_id: 1, slot_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("SlotAvailability", slotAvailabilitySchema);