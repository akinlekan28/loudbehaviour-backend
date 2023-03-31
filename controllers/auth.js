const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require('../utils/cloudinary');
const forgotPassword = require('../utils/emails/forgotPassword');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, phone, email, password, role } =
    req.body;

  // Create user
  const user = await User.create({
    firstName,
    lastName,
    phone,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(
      new ErrorResponse('Please provide an email and password', 400)
    );
  }

  // Check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse('Invalid credentials', 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/profile
// @access    Private
exports.profile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Get statistics of logged in user
// @route     GET /api/v1/auth/serviceanalytics
// @access    Private
exports.getStatistics = asyncHandler(async (req, res, next) => {
  const subscriptions = await Order.find({})
    .where('user')
    .equals(req.user.id);
  const notifications = await Notification.countDocuments()
    .where('user')
    .equals(req.user.id);

  const activeSubscription = [];
  const awaitingApproval = [];
  const expired = [];

  subscriptions.forEach((item) => {
    if (item.status == 'Completed') {
      expired.push(item);
    }
    if (item.status == 'In Progress') {
      activeSubscription.push(item);
    }
    if (item.status == 'Pending') {
      awaitingApproval.push(item);
    }
  });

  return res.status(200).json({
    activeSubscription: activeSubscription.length,
    awaitingApproval: awaitingApproval.length,
    expired: expired.length,
    notifications,
  });
});

// @desc      Update user profile
// @route     PUT /api/v1/auth/profile/:id
// @access    Private
exports.updateProfile = asyncHandler(async (req, res, next) => {
  let userProfile = await User.findById(req.params.id);
  let imageDetails;

  if (!userProfile) {
    return next(new ErrorResponse(`User profile not found`, 404));
  }

  if (req.files) {
    imageDetails = await uploadToCloudinary(
      req.files.image.tempFilePath
    );
    if (userProfile.imagePublicId) {
      await deleteFromCloudinary(userProfile.imagePublicId);
    }
  }

  if (imageDetails && imageDetails.public_id) {
    req.body.image = imageDetails.secure_url;
    req.body.imagePublicId = imageDetails.public_id;
  }

  req.body.updatedAt = Date.now();

  userProfile = await User.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: userProfile });
});

// @desc      Get all users
// @route     GET /api/v1/auth/users
// @access    Private
exports.getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});

  return res.status(200).json({
    success: true,
    count: users.length,
    data: users,
  });
});

// @desc      Get all users with pagination
// @route     GET /api/v1/auth/users/all
// @access    Private
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Get all archived users with pagination
// @route     GET /api/v1/auth/users/archived
// @access    Private
exports.getArchivedUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.paginationWithQuery);
});

// @desc      Get all admin users with pagination
// @route     GET /api/v1/auth/users/admin
// @access    Private
exports.getAdminUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.paginationWithQuery);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public
exports.forgotpassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse('There is no user with that email', 404)
    );
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const link = `${process.env.CLIENT_URL}/reset/${resetToken}`;

  // const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    const html = forgotPassword({
      name: user.firstName,
      link,
    });

    await sendEmail({
      email: user.email,
      subject: 'Password reset',
      html,
    });

    res
      .status(200)
      .json({ success: true, data: 'Reset email has been sent!' });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse('Email could not be sent', 500));
  }
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse('Invalid token', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res.status(statusCode).cookie('token', token, options).json({
    success: true,
    token,
  });
};
