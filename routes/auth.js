const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Login user
router.post("/login", authController.login);

// Register user
router.post("/register", authController.register);

// Forgot password
router.post("/forgot-password", authController.forgotPassword);

// Reset password
router.post("/reset-password", authController.resetPassword);

module.exports = router;
