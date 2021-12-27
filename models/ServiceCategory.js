const mongoose = require("mongoose");

const ServiceCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  serviceId: {
    type: mongoose.Schema.ObjectId,
    ref: "Service",
    required: true,
  },
  image: {
    type: String,
    required: [true, "A valid image url must be supplied"],
  },
  imagePublicId: {
    type: String,
  },
  slug: {
    type: String,
  },
  description: {
    type: String,
  },
  is_delete: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ServiceCategory", ServiceCategorySchema);
