const express = require("express");
const {
  getUserNotifications,
  createNotification,
  getNotifications,
  readAllNotifications,
} = require("../controllers/notification");
const Notification = require("../models/Notification");
const router = express.Router();

const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advancedResults");

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
router.get("/user", protect, getUserNotifications);

module.exports = router;
