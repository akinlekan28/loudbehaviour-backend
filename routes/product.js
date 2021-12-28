const express = require("express");
const {
  createProduct,
  getProducts,
  updateProduct,
  deleteProduct,
  getArchiveProducts,
} = require("../controllers/product");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .post(protect, authorize("admin"), createProduct)
  .get(getProducts);
router
  .route("/:id")
  .put(protect, authorize("admin"), updateProduct)
  .post(protect, authorize("admin"), deleteProduct);

router.get(
  "/archive",
  protect,
  authorize("admin", "publisher"),
  getArchiveProducts
);

module.exports = router;
