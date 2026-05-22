const mongoose = require("mongoose");

const serviceScopeSchema = new mongoose.Schema(
  {
    scope_id:        { type: String,  required: true, unique: true, trim: true },
    label:           { type: String,  required: true, trim: true },
    is_mandatory:    { type: Boolean, default: false },
    default_checked: { type: Boolean, default: false },
    is_active:       { type: Boolean, default: true  },
    sort_order:      { type: Number,  default: 0     },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceScope", serviceScopeSchema);