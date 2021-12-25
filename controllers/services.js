const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Service = require("../models/Service");
const slugify = require("../utils/slugify");

// @desc      Add service
// @route     POST /api/v1/service
// @access    Private
exports.createService = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;

  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to add a service`, 401)
    );
  }

  req.body.slug = slugify(req.body.name);

  const service = await Service.create(req.body);

  res.status(201).json({
    success: true,
    data: service,
  });
});

// @desc      Get services
// @route     GET /api/v1/service
// @access    Private
exports.getServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find({}).where("is_delete").equals(0);

  return res.status(200).json({
    success: true,
    count: services.length,
    data: services,
  });
});

// @desc      Update service
// @route     PUT /api/v1/service/:id
// @access    Private
exports.updateService = asyncHandler(async (req, res, next) => {
  let serviceItem = await Service.findById(req.params.id);

  if (!serviceItem) {
    return next(new ErrorResponse(`Service not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to update this service`, 401)
    );
  }

  req.body.slug = slugify(req.body.name);

  serviceItem = await Service.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: serviceItem });
});

// @desc      Delete service
// @route     POST /api/v1/service/:id
// @access    Private
exports.deleteService = asyncHandler(async (req, res, next) => {
  let serviceItem = await Service.findById(req.params.id);

  if (!serviceItem) {
    return next(new ErrorResponse(`Service not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to delete this service`, 401)
    );
  }

  serviceItem = await Service.findByIdAndUpdate(
    req.params.id,
    { is_delete: 1 },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: "Service has been deleted" });
});
