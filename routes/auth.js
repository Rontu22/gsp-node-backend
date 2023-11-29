const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// send otp
router.post("/send-otp", authController.sendOtp);

router.post("/verify-otp", authController.verifyOtp);

// Register user
router.post("/register", authController.register);

// login
router.post("/login", authController.login);

// signup
router.post("/signup", authController.signup);

module.exports = router;
