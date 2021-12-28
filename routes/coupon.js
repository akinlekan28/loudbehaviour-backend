const express = require("express");
const {
  createCoupon,
  updateCoupon,
  getCoupons,
  deleteCoupon,
} = require("../controllers/coupon");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, authorize("admin", "publisher"), getCoupons)
  .post(protect, authorize("admin"), createCoupon);
router
  .route("/:id")
  .put(protect, authorize("admin"), updateCoupon)
  .post(protect, authorize("admin"), deleteCoupon);

module.exports = router;
