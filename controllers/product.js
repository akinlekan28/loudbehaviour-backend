const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Product = require("../models/Product");
const slugify = require("../utils/slugify");
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

// @desc      Add product
// @route     POST /api/v1/product
// @access    Private
exports.createProduct = asyncHandler(async (req, res, next) => {
  req.body.user = req.user.id;
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to add a product`, 401)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Product Image needs to be uploaded`, 400));
  }

  const imageDetails = await uploadToCloudinary(req.files.image.tempFilePath);

  if (imageDetails.public_id) {
    req.body.image = imageDetails.secure_url;
    req.body.imagePublicId = imageDetails.public_id;
    req.body.slug = slugify(req.body.name);
    const product = await Product.create(req.body);
    res.status(201).json({
      success: true,
      data: product,
    });
  } else {
    return next(
      new ErrorResponse(`Something went wrong trying to upload the image`, 400)
    );
  }
});

// @desc      GET product
// @route     GET /api/v1/product
// @access    Private
exports.getProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({}).where("is_delete").equals(0);

  return res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc      Edit product
// @route     PUT /api/v1/product/:id
// @access    Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
  let productItem = await Product.findById(req.params.id);
  let imageDetails;

  if (!productItem) {
    return next(new ErrorResponse(`Product not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to update this product`, 401)
    );
  }

  if (req.files) {
    imageDetails = await uploadToCloudinary(req.files.image.tempFilePath);
    await deleteFromCloudinary(productItem.imagePublicId);
  }

  if (imageDetails && imageDetails.public_id) {
    req.body.image = imageDetails.secure_url;
    req.body.imagePublicId = imageDetails.public_id;
  }

  req.body.slug = slugify(req.body.name);
  req.body.updatedAt = Date.now();

  productItem = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: productItem });
});

// @desc      Delete product
// @route     POST /api/v1/product/:id
// @access    Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  let productItem = await Product.findById(req.params.id);

  if (!productItem) {
    return next(new ErrorResponse(`Product not found`, 404));
  }
  if (req.user.role !== "admin") {
    return next(
      new ErrorResponse(`User is not authorized to delete this product`, 401)
    );
  }

  productItem = await Product.findByIdAndUpdate(
    req.params.id,
    { is_delete: 1 },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({ success: true, data: "Product has been deleted" });
});

// @desc      GET archived product
// @route     GET /api/v1/product/archive
// @access    Private
exports.getArchiveProducts = asyncHandler(async (req, res, next) => {
  const products = await Product.find({}).where("is_delete").equals(1);

  return res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});
