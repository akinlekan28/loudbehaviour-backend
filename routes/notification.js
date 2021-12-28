const express = require("express");
const {
  getUserNotifications,
  createNotification,
  getNotifications,
  readAllNotifications,
  readNotification,
} = require("../controllers/notification");
const Notification = require("../models/Notification");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");
const paginationWithQuery = require("../middleware/paginationWithQuery");

router
  .route("/")
  .get(
    protect,
    authorize("admin", "publisher"),
    advancedResults(Notification),
    getNotifications
  )
  .post(createNotification)
  .put(protect, readAllNotifications);
router.get(
  "/user",
  protect,
  paginationWithQuery(Notification, {
    type: "find",
    conditions: "user",
    sort: true,
  }),
  getUserNotifications
);

router.put("/:id", protect, readNotification);

module.exports = router;
