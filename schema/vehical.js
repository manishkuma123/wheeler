const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    vehicle_id: {
      type: String,
      unique: true,
      default: () => "vh_" + Math.random().toString(36).substring(2, 9),
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type_id: {
      type: String,
      required: [true, "type_id is required"],
      trim: true,
    },
    brand_id: {
      type: String,
      required: [true, "brand_id is required"],
      trim: true,
    },
    model_id: {
      type: String,
      required: [true, "model_id is required"],
      trim: true,
    },
    fuel_type: {
      type: String,
      required: [true, "fuel_type is required"],
      enum: {
        values: ["Petrol", "Diesel", "Electric", "CNG", "Hybrid"],
        message: "fuel_type must be one of: Petrol, Diesel, Electric, CNG, Hybrid",
      },
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    registration_number: {
      type: String,
      required: [true, "registration_number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    motor_policy_number: {
      type: String,
      trim: true,
      default: null,
    },
    front_photo: {
      type: String,
      required: [true, "front_photo is required"],
    },
    rear_photo: {
      type: String,
      required: [true, "rear_photo is required"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Vehicle", vehicleSchema);