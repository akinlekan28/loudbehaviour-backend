const mongoose = require("mongoose");

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  slug: {
    type: String,
  },
  image: {
    type: String,
    required: [true, "A valid image url must be supplied"],
  },
  imagePublicId: {
    type: String,
  },
  description: {
    type: String,
    required: [true, "Please add a description"],
  },
  is_delete: {
    type: Number,
    default: 0,
  },
  has_products: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Service", ServiceSchema);
