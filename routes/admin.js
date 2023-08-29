const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// send otp
router.post("/send-otp", adminController.sendOtp);

router.post("/verify-otp", adminController.verifyOtp);

// Register user
router.post("/register", adminController.register);

// get all users
router.get("/get-all-users", adminController.getAllUsers);

// approve all users
router.post("/approve-all-users", adminController.approveAllUsers);

module.exports = router;
