const express = require("express");
const passport = require("passport");
const {
  register,
  login,
  forgotpassword,
  resetPassword,
  profile,
  getUsers,
  updateProfile, getStatistics
} = require("../controllers/auth");

const router = express.Router();
const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, profile);
router.get("/users", protect, getUsers);
router.post("/forgotpassword", forgotpassword);
router.get("/serviceanalytics", protect, getStatistics);
router.put("/resetpassword/:resettoken", resetPassword);
router.put("/profile/:id", updateProfile);
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    req.session.userId = req.user._id;
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  }
);
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"],
  })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  })
);

module.exports = router;
