const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ServiceCategory = require("../models/ServiceCategory");
const slugify = require("../utils/slugify");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

// @desc      Add service category
// @route     POST /api/v1/servicecategory
// @access    Private
exports.createServiceCategory = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to add a service`, 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Image needs to be uploaded`, 400));
  }

  const imageDetails = await uploadToCloudinary(req.files.image.tempFilePath);

  if (imageDetails.public_id) {
    req.body.image = imageDetails.secure_url;
    req.body.imagePublicId = imageDetails.public_id;
    req.body.slug = slugify(req.body.name);
    const servicesCategory = await ServiceCategory.create(req.body);
    res.status(201).json({
      success: true,
      data: servicesCategory,
    });
  } else {
    return next(
      new ErrorResponse(`Something went wrong trying to upload the image`, 400)
    );
  }
});

// @desc      Update service category
// @route     PUT /api/v1/servicecategory/:id
// @access    Private
exports.updateServiceCategory = asyncHandler(async (req, res, next) => {
  let serviceCategoryItem = await ServiceCategory.findById(req.params.id);
  let imageDetails;

  if (!serviceCategoryItem) {
    return next(new ErrorResponse(`Service not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to update this service`, 401)
    );
  }

  if (req.files) {
    imageDetails = await uploadToCloudinary(req.files.image.tempFilePath);
    await deleteFromCloudinary(serviceCategoryItem.imagePublicId);
  }

  if (imageDetails && imageDetails.public_id) {
    req.body.image = imageDetails.secure_url;
    req.body.imagePublicId = imageDetails.public_id;
  }

  req.body.slug = slugify(req.body.name);

  serviceCategoryItem = await ServiceCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: serviceCategoryItem });
});
