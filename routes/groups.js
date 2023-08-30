const express = require("express");
const router = express.Router();
const groupController = require("../controllers/groupsController");

router.post("/create-group", groupController.createGroup);

router.post("/edit-group", groupController.editGroup);

router.post("/add-group-members", groupController.addGroupMembers);

router.get(
  "/get-all-groups-by-user-id/:userId",
  groupController.getAllGroupsByUserId
);

router.get("/get-all-group-members", groupController.getAllGroupMembers);

module.exports = router;
