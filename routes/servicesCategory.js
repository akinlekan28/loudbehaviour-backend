const express = require("express");
const { createServiceCategory } = require("../controllers/servicesCategory");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router.route("/").post(protect, authorize("admin"), createServiceCategory);
// router
//   .route("/:id")
//   .put(protect, authorize("admin"), updateService)
//   .post(protect, authorize("admin"), deleteService);

module.exports = router;
