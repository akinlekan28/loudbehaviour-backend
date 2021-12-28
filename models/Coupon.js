const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Coupon name is required"],
  },
  percentageValue: {
    type: Number,
    default: 0,
  },
  total_used: {
    type: Number,
    default: 0,
  },
  is_delete: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

CouponSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Coupon", CouponSchema);
