const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Coupon = require("../models/Coupon");

// @desc      Add coupon
// @route     POST /api/v1/coupon
// @access    Private
exports.createCoupon = asyncHandler(async (req, res, next) => {
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to add a service`, 401)
    );
  }

  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    success: true,
    data: coupon,
  });
});

// @desc      Get coupons
// @route     GET /api/v1/coupon
// @access    Private
exports.getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find({}).where("is_delete").equals(0);

  return res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons,
  });
});

// @desc      Get coupon
// @route     GET /api/v1/coupon/:id
// @access    Public
exports.getCoupon = asyncHandler(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(
      new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: coupon });
});

// @desc      Update coupon
// @route     PUT /api/v1/coupon/:id
// @access    Private
exports.updateCoupon = asyncHandler(async (req, res, next) => {
  let couponItem = await Coupon.findById(req.params.id);

  if (!couponItem) {
    return next(new ErrorResponse(`Coupon not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to update this coupon`, 401)
    );
  }

  couponItem = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: couponItem });
});

// @desc      Delete coupon
// @route     POST /api/v1/coupon/:id
// @access    Private
exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  let couponItem = await Coupon.findById(req.params.id);

  if (!couponItem) {
    return next(new ErrorResponse(`Coupon not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to delete this service`, 401)
    );
  }

  couponItem = await Coupon.findByIdAndUpdate(
    req.params.id,
    { is_delete: 1 },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: "Coupon has been deleted" });
});
