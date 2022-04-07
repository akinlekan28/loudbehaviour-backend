const express = require("express");
const {
  createService,
  updateService,
  getServices,
  deleteService,
  getArchivedServices,
} = require("../controllers/services");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(getServices)
  .post(protect, authorize("admin"), createService);
router
  .route("/:id")
  .get(protect, authorize("admin"), getArchivedServices)
  .put(protect, authorize("admin"), updateService)
  .post(protect, authorize("admin"), deleteService);

module.exports = router;
