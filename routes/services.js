const express = require("express");
const {
  createService,
  updateService,
  getServices,
  deleteService,
} = require("../controllers/services");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, authorize("admin", "publisher"), getServices)
  .post(protect, authorize("admin"), createService);
router
  .route("/:id")
  .put(protect, authorize("admin"), updateService)
  .post(protect, authorize("admin"), deleteService);

module.exports = router;
