const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  price: {
    type: Number,
    required: [true, "Please add a price"],
  },
  serviceCategoryId: {
    type: String,
    required: [true, "Service category is required"],
  },
  image: {
    type: String,
    required: [true, "A valid image url must be supplied"],
  },
  imagePublicId: {
    type: String,
  },
  discount: {
    type: Number,
    default: 0,
  },
  slug: {
    type: String,
  },
  canPayOnline: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: [true, "Product description is required"],
  },
  deliveryDays: {
    type: String,
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

module.exports = mongoose.model("Product", ProductSchema);
