const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupsController");

router.post("/create-group", groupController.createGroup);

router.post("/edit-group", groupController.editGroup);

router.post("/add-group-members", groupController.addGroupMembers);

module.exports = router;
