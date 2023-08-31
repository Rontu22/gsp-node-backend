const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// send otp
router.post("/send-otp", authController.sendOtp);

router.post("/verify-otp", authController.verifyOtp);

// Register user
router.post("/register", authController.register);

module.exports = router;
