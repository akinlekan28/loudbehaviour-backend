const express = require("express");
const {
  createServiceCategory,
  updateServiceCategory,
} = require("../controllers/servicesCategory");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.route("/").post(protect, authorize("admin"), createServiceCategory);
router.route("/:id").put(protect, authorize("admin"), updateServiceCategory);

module.exports = router;
