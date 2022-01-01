const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Order = require("../models/Order");
// const Product = require("../models/Product");
// const Coupon = require("../models/Coupon");

// @desc      Add order
// @route     POST /api/v1/order
// @access    Private
exports.createOrder = asyncHandler(async (req, res, next) => {
  let sku = Math.random().toString(36).slice(2).toUpperCase();
  req.body.sku = "LB" + sku;

  const order = await Order.create(req.body);

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc      Update order
// @route     PUT /api/v1/order/:id
// @access    Private
exports.updateOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found`, 404));
  }

  req.body.updatedAt = Date.now();

  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: order });
});

// @desc      Get order
// @route     GET /api/v1/order/:id
// @access    Private
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`Order not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ success: true, data: order });
});

// @desc      Get orders
// @route     GET /api/v1/order
// @access    Private
exports.getOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.paginationWithQuery);
});

// @desc      Get orders
// @route     GET /api/v1/order/archive
// @access    Private
exports.getArchiveOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.paginationWithQuery);
});

// @desc      Get user orders
// @route     GET /api/v1/order/user
// @access    Private
exports.getUserOrders = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.paginationWithQuery);
});

// @desc      Archive order
// @route     POST /api/v1/order/id:
// @access    Private
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse(`Order not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to delete this service`, 401)
    );
  }

  order = await Order.findByIdAndUpdate(
    req.params.id,
    { is_delete: 1 },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: "Order has been deleted" });
});

//TODO: payment webhook
