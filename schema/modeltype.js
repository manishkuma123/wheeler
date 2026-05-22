const mongoose = require("mongoose");

const modelSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand", required: true },
}, { timestamps: true });

module.exports = mongoose.model("VehicleModel", modelSchema);