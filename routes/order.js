const express = require("express");
const {
  createOrder,
  updateOrder,
  getOrders,
  getUserOrders,
  getOrder,
  deleteOrder,
  getArchiveOrders,
} = require("../controllers/order");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const paginationWithQuery = require("../middleware/paginationWithQuery");
const Order = require("../models/Order");

router
  .route("/")
  .post(createOrder)
  .get(
    protect,
    authorize("admin", "publisher", "user"),
    paginationWithQuery(
      Order,
      {
        type: "find",
        conditions: "non_deleted",
        sort: true,
      },
      {
        path: "product user",
        select: "name deliveryDays price firstName lastName",
      }
    ),
    getOrders
  );

router
  .route("/:id")
  .put(updateOrder)
  .get(protect, getOrder)
  .post(protect, authorize("admin"), deleteOrder);

router.get(
  "/user/history",
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
      select: "name deliveryDays image description logo",
    }
  ),
  getUserOrders
);

router.get(
  "/archive/all",
  protect,
  authorize("admin", "publisher"),
  paginationWithQuery(
    Order,
    {
      type: "find",
      conditions: "deleted",
      sort: true,
    },
    {
      path: "product user",
      select: "name deliveryDays price firstName lastName",
    }
  ),
  getArchiveOrders
);

module.exports = router;
