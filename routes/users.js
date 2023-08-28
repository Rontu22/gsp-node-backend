const express = require("express");
const router = express.Router();
const usersController = require("../controllers/userController");

router.get("/get-all-users", usersController.getAllUsers);

module.exports = router;
