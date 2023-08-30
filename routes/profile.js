const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

router.post("/edit-profile", profileController.editProfile);

router.get("/get-profile", profileController.getProfile);

module.exports = router;
