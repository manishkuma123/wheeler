const mongoose = require("mongoose");

const vehicleTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VehicleType", vehicleTypeSchema);