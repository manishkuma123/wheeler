// const mongoose = require("mongoose");

// const addressSchema = new mongoose.Schema({
//   address_line1: { type: String, trim: true },
//   city:          { type: String, trim: true },
//   state:         { type: String, trim: true },
//   pincode:       { type: String, trim: true },
//   latitude:      { type: Number },
//   longitude:     { type: Number },
// }, { _id: false });

// const bookingSchema = new mongoose.Schema({
//   booking_id:          { type: String, unique: true, trim: true },
//   razorpay_payment_id: { type: String, default: null },
//   razorpay_order_id:   { type: String, default: null },
//   pay_after_delivery:  { type: Boolean, default: false },
//   payment_status:      { type: String, enum: ["success", "pending", "failed"], default: "pending" },
//   amount_paid:         { type: Number, default: 0 },
//   currency:            { type: String, default: "INR" },
//   user_id:             { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   vehicle_id:          { type: String, required: true },
//   service_type_id:     { type: String, required: true },
//   selected_issue_ids:  { type: [String], default: [] },
//   complaint_text:      { type: String, default: null },
//   approval_type:       { type: String, enum: ["call_always", "threshold", "custom"], required: true },
//   threshold_amount:    { type: Number, default: null },
//   centre_id:           { type: String, required: true },
//   pickup_address_id:   { type: String, default: null },
//   pickup_address:      { type: addressSchema, default: null },
//   delivery_address_id: { type: String, default: null },
//   delivery_address:    { type: addressSchema, default: null },
//   pickup_date:         { type: String, required: true },
//   pickup_slot_id:      { type: String, required: true },
//   delivery_preference_id: { type: String, required: true },
//   booking_status:      { type: String, enum: ["confirmed","pending","cancelled","completed"], default: "confirmed" },
// }, { timestamps: true });


// bookingSchema.pre("save", function () {
//   if (!this.booking_id) {
//     const rand = Math.floor(1000 + Math.random() * 9000);
//     const suffix = Math.random()
//       .toString(36)
//       .substring(2, 4)
//       .toUpperCase();

//     this.booking_id = `RS-${rand}-${suffix}`;
//   }
// });

// module.exports = mongoose.model("Booking", bookingSchema);
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  address_line1: { type: String, trim: true },
  city:          { type: String, trim: true },
  state:         { type: String, trim: true },
  pincode:       { type: String, trim: true },
  latitude:      { type: Number },
  longitude:     { type: Number },
}, { _id: false });

// ── ADD THIS ─────────────────────────────────────────
const riderSchema = new mongoose.Schema({
  name:   { type: String, default: null },
  phone:  { type: String, default: null },
  rating: { type: Number, default: null },
  image:  { type: String, default: null },
}, { _id: false });

const riderLocationSchema = new mongoose.Schema({
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
}, { _id: false });
// ─────────────────────────────────────────────────────

const bookingSchema = new mongoose.Schema({
  booking_id:          { type: String, unique: true, trim: true },
  razorpay_payment_id: { type: String, default: null },
  razorpay_order_id:   { type: String, default: null },
  pay_after_delivery:  { type: Boolean, default: false },
  payment_status:      { type: String, enum: ["success", "pending", "failed"], default: "pending" },
  amount_paid:         { type: Number, default: 0 },
  currency:            { type: String, default: "INR" },
  user_id:             { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  vehicle_id:          { type: String, required: true },
  service_type_id:     { type: String, required: true },
  selected_issue_ids:  { type: [String], default: [] },
  complaint_text:      { type: String, default: null },
  approval_type:       { type: String, enum: ["call_always", "threshold", "custom"], required: true },
  threshold_amount:    { type: Number, default: null },
  centre_id:           { type: String, required: true },
  pickup_address_id:   { type: String, default: null },
  pickup_address:      { type: addressSchema, default: null },
  delivery_address_id: { type: String, default: null },
  delivery_address:    { type: addressSchema, default: null },
  pickup_date:         { type: String, required: true },
  pickup_slot_id:      { type: String, required: true },
  delivery_preference_id: { type: String, required: true },

  // ── UPDATED ENUM (full status flow) ──────────────
  booking_status: {
    type: String,
    enum: [
      "confirmed",
      "rider_assigned",
      "on_the_way",
      "picked_up",
      "in_service",
      "approval_pending",
      "approved",
      "ready_for_delivery",
      "delivered",
      "completed",
      "cancelled",
    ],
    default: "confirmed",
  },
  // ─────────────────────────────────────────────────

  // ── Rider tracking ────────────────────────────────
  assigned_rider:  { type: riderSchema,         default: null },
  rider_location:  { type: riderLocationSchema, default: null },
  eta_minutes:     { type: Number,              default: null },

  // ── Booking timeline events ───────────────────────
  timeline: {
    type: [
      new mongoose.Schema(
        {
          status:       { type: String },
          title:        { type: String },
          description:  { type: String, default: null },
          time:         { type: String, default: null },
          is_completed: { type: Boolean, default: false },
        },
        { _id: false }
      ),
    ],
    default: [],
  },

  // ── Vehicle condition images ──────────────────────
  vehicle_condition: {
    type: new mongoose.Schema(
      {
        before: { type: [String], default: [] },
        after:  { type: [String], default: [] },
      },
      { _id: false }
    ),
    default: () => ({ before: [], after: [] }),
  },

  // ── Fare breakdown ────────────────────────────────
  fare: {
    type: new mongoose.Schema(
      {
        distance_km:     { type: Number, default: null },
        base_fare:       { type: Number, default: null },
        extra_km_charge: { type: Number, default: 0    },
        total_amount:    { type: Number, default: null },
        payment_method:  { type: String, default: null },
      },
      { _id: false }
    ),
    default: null,
  },

  // ── Invoice & service bill ────────────────────────
  invoice_url:           { type: String,  default: null  },
  service_bill_uploaded: { type: Boolean, default: false },
  service_bill_id:       { type: String,  default: null  },

  // ── Misc flags ────────────────────────────────────
  reference_no: { type: String, default: null },
  is_rated:     { type: Boolean, default: false },
  // ─────────────────────────────────────────────────

}, { timestamps: true });


bookingSchema.pre("save", function () {
  if (!this.booking_id) {
    const rand = Math.floor(1000 + Math.random() * 9000);
    const suffix = Math.random()
      .toString(36)
      .substring(2, 4)
      .toUpperCase();

    this.booking_id = `RS-${rand}-${suffix}`;
  }
});

module.exports = mongoose.model("Booking", bookingSchema);