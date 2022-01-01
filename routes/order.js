const express = require("express");
const {
  createOrder,
  updateOrder,
  getOrders,
  getUserOrders,
  getOrder,
} = require("../controllers/order");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const paginationWithQuery = require("../middleware/paginationWithQuery");
const Order = require("../models/Order");

router
  .route("/")
  .post(createOrder)
  .get(
    protect,
    authorize("admin", "publisher"),
    advancedResults(Order, {
      path: "product user",
      select: "name deliveryDays price firstName lastName",
    }),
    getOrders
  );

router.route("/:id").put(updateOrder).get(protect, getOrder);

router.get(
  "/user",
  protect,
  paginationWithQuery(
    Order,
    {
      type: "find",
      conditions: "user",
      sort: true,
    },
    {
      path: "product",
      select: "name deliveryDays",
    }
  ),
  getUserOrders
);

module.exports = router;
