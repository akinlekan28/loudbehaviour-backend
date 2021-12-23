const express = require("express");
const {
  register,
  login,
  forgotpassword,
  resetPassword,
} = require("../controllers/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/forgotpassword", forgotpassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
