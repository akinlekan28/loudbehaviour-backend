const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const ServiceCategory = require("../models/ServiceCategory");
const slugify = require("../utils/slugify");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");
const Service = require("../models/Service");

// @desc      Add service category
// @route     POST /api/v1/servicecategory
// @access    Private
exports.createServiceCategory = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  let logoDetails;
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to add a service`, 401)
    );
  }

  if (!req.files.image) {
    return next(new ErrorResponse(`Image needs to be uploaded`, 400));
  }

  const imageDetails = await uploadToCloudinary(req.files.image.tempFilePath);
  if (req.files.logo) {
    logoDetails = await uploadToCloudinary(req.files.logo.tempFilePath);

    if (logoDetails.public_id) {
      req.body.logo = logoDetails.secure_url;
      req.body.logoPublicId = logoDetails.public_id;
    }
  }

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

// @desc      GET service category
// @route     GET /api/v1/servicecategory
// @access    Private
exports.getServiceCategories = asyncHandler(async (req, res, next) => {
  const servicesCategories = await ServiceCategory.find({})
    .where("is_delete")
    .equals(0);

  return res.status(200).json({
    success: true,
    count: servicesCategories.length,
    data: servicesCategories,
  });
});

// @desc      GET service category by slug
// @route     GET /api/v1/servicecategory/all/:slug
// @access    Public
exports.getServiceCategoryBySlug = asyncHandler(async (req, res, next) => {
  let service = await Service.findOne({ slug: req.params.slug });

  if (service && service._id) {
    let serviceCategories = await ServiceCategory.find({
      serviceId: service._id,
    })
      .populate("serviceId", "name", Service)
      .where("is_delete")
      .equals(0);

    return res.status(200).json({
      success: true,
      count: serviceCategories.length,
      data: serviceCategories,
    });
  } else {
    return res
      .status(404)
      .json({ success: false, message: "Categories could not be fetched" });
  }
});

// @desc      GET paginated service category by slug
// @route     GET /api/v1/servicecategory/paginated/:slug
// @access    Public
exports.getPaginatedServiceCategoryBySlug = asyncHandler(
  async (req, res, next) => {
    let service = await Service.findOne({ slug: req.params.slug });
    total = await ServiceCategory.countDocuments()
      .where("is_delete")
      .equals(0)
      .where("slug")
      .equals(req.params.slug);
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    if (service && service._id) {
      let serviceCategories = await ServiceCategory.find({
        serviceId: service._id,
      })
        .skip(startIndex)
        .limit(limit)
        .where("is_delete")
        .equals(0);

      const pagination = {};

      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }
      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }

      return res.status(200).json({
        success: true,
        count: serviceCategories.length,
        pagination,
        data: serviceCategories,
      });
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Categories could not be fetched" });
    }
  }
);

// @desc      GET archived service category
// @route     GET /api/v1/servicecategory/archive
// @access    Private
exports.getArchiveServiceCategories = asyncHandler(async (req, res, next) => {
  const servicesCategories = await ServiceCategory.find({})
    .where("is_delete")
    .equals(1);

  return res.status(200).json({
    success: true,
    count: servicesCategories.length,
    data: servicesCategories,
  });
});

// @desc      Update service category
// @route     PUT /api/v1/servicecategory/:id
// @access    Private
exports.updateServiceCategory = asyncHandler(async (req, res, next) => {
  let serviceCategoryItem = await ServiceCategory.findById(req.params.id);
  let imageDetails;
  let logoDetails;

  if (!serviceCategoryItem) {
    return next(new ErrorResponse(`Service not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to update this service`, 401)
    );
  }

  if (req.files && req.files.image) {
    imageDetails = await uploadToCloudinary(req.files.image.tempFilePath);
    await deleteFromCloudinary(serviceCategoryItem.imagePublicId);
  }

  if (req.files && req.files.logo) {
    logoDetails = await uploadToCloudinary(req.files.logo.tempFilePath);
    await deleteFromCloudinary(serviceCategoryItem.logoPublicId);
  }

  if (logoDetails && logoDetails.public_id) {
    req.body.logo = logoDetails.secure_url;
    req.body.logoPublicId = logoDetails.public_id;
  }

  if (imageDetails && imageDetails.public_id) {
    req.body.image = imageDetails.secure_url;
    req.body.imagePublicId = imageDetails.public_id;
  }

  if (req.body.name) {
    req.body.slug = slugify(req.body.name);
  }

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

// @desc      Delete service category
// @route     POST /api/v1/servicecategory/:id
// @access    Private
exports.deleteServiceCategory = asyncHandler(async (req, res, next) => {
  let serviceCategoryItem = await ServiceCategory.findById(req.params.id);

  if (!serviceCategoryItem) {
    return next(new ErrorResponse(`Service category not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to delete this service`, 401)
    );
  }

  serviceCategoryItem = await ServiceCategory.findByIdAndUpdate(
    req.params.id,
    { is_delete: 1 },
    {
      new: true,
      runValidators: true,
    }
  );

  res
    .status(200)
    .json({ success: true, data: "Service category has been deleted" });
});
