const mongoose = require("mongoose");

const serviceCentreSchema = new mongoose.Schema(
  {
    centre_id: {
      type: String,
      required: [true, "Centre ID is required"],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Centre name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },
    is_authorised: {
      type: Boolean,
      default: false,
    },
    is_registered: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    operating_hours: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    review_count: {
      type: Number,
      default: 0,
    },
    centre_image: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);


serviceCentreSchema.index({ location: "2dsphere" });
serviceCentreSchema.index({ is_authorised: 1, is_registered: 1, is_active: 1 });
serviceCentreSchema.index({ area: "text", pincode: "text", name: "text" });

const ServiceCentre = mongoose.model("ServiceCentre", serviceCentreSchema);

module.exports = ServiceCentre;