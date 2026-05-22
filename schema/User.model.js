const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
    },
    country_code: {
      type: String,
      default: "+91",
    },
    profile_complete: {
      type: Boolean,
      default: false,
    },
    first_name: {
      type: String,
      default: null,
    },


     last_name: {
      type: String,
      default: null,
    },

    email: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    last_login: {
      type: Date,
      default: null,
    },



profile_photo: {
  type: String,
  default: null,
},
notification_settings: {
  order_assigned:     { type: Boolean, default: true },
  order_on_way:       { type: Boolean, default: true },
  vehicle_picked_up:  { type: Boolean, default: true },
  vehicle_ready:      { type: Boolean, default: true },
  order_delivering:   { type: Boolean, default: true },
  vehicle_delivered:  { type: Boolean, default: true },
  booking_reminder:   { type: Boolean, default: false },
  offers_promotions:  { type: Boolean, default: true },
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
