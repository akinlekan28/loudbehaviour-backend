const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Notification = require("../models/Notification");
const paginationWithQuery = require("../middleware/paginationWithQuery");

// @desc      Add notification
// @route     POST /api/v1/notification
// @access    Public
exports.createNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.create(req.body);

  res.status(201).json({
    success: true,
    data: notification,
  });
});

// @desc      Read notification
// @route     PUT /api/v1/notification/:id
// @access    Private
exports.readNotification = asyncHandler(async (req, res, next) => {
  let notificationItem = await Notification.findById(req.params.id);

  if (!notificationItem) {
    return next(new ErrorResponse(`Notification not found`, 404));
  }

  req.body.updatedAt = Date.now();

  notificationItem = await Notification.findByIdAndUpdate(
    req.params.id,
    { isRead: true },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true });
});

// @desc      Read all user notification
// @route     PUT /api/v1/notification
// @access    Private
exports.readAllNotifications = asyncHandler(async (req, res, next) => {
  const user = (req.body.user = req.user.id);
  const readNotifications = await Notification.updateMany(
    { user },
    { $set: { isRead: true, updatedAt: Date.now() } }
  );

  res.status(200).json({ status: true, readNotifications });
});

// @desc      Get user notification
// @route     GET /api/v1/notification/user
// @access    Private
exports.getUserNotifications = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.paginationWithQuery);
});

// @desc      Get all notification
// @route     GET /api/v1/notification
// @access    Private
exports.getNotifications = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});
