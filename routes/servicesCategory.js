const express = require("express");
const {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
} = require("../controllers/servicesCategory");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(protect, authorize("admin"), createServiceCategory)
  .get(protect, authorize("admin", "publisher"), getServiceCategories);
router
  .route("/:id")
  .put(protect, authorize("admin"), updateServiceCategory)
  .post(protect, authorize("admin"), deleteServiceCategory);

module.exports = router;
