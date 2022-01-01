const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
  },
  product: {
    type: mongoose.Schema.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  link: {
    type: String,
    required: [true, "Product link is required"],
  },
  discount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["Completed", "In Progress", "Cancelled", "Inactive"],
    default: "Inactive",
  },
  paymentChannel: {
    type: String,
    required: true,
  },
  paymentReference: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ["Success", "Failed", "Pending"],
    default: "Pending",
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

OrderSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Order", OrderSchema);
