const express = require("express");
const {
  createServiceCategory,
  updateServiceCategory,
  deleteServiceCategory,
  getServiceCategories,
  getArchiveServiceCategories,
  getServiceCategoryBySlug,
  getPaginatedServiceCategoryBySlug,
} = require("../controllers/servicesCategory");
const advancedResults = require("../middleware/advancedResults");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(protect, authorize("admin"), createServiceCategory)
  .get(getServiceCategories);
router
  .route("/:id")
  .put(protect, authorize("admin"), updateServiceCategory)
  .post(protect, authorize("admin"), deleteServiceCategory);

router.get(
  "/archive",
  protect,
  authorize("admin", "publisher"),
  getArchiveServiceCategories
);

router.get("/all/:slug", getServiceCategoryBySlug);
router.get("/paginated/:slug", getPaginatedServiceCategoryBySlug);

module.exports = router;
