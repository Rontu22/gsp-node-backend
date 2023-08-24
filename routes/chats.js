const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// send-message
router.post("/send-message", chatController.sendMessage);

router.get("/get-all-messages", chatController.getAllMessages);

router.get("/get-message-by-id/:id", chatController.getMessageById);

router.get("/receive-last-message", chatController.receiveLastMessage);

router.get(
  "/get-all-messages-from-message-id",
  chatController.getAllMessagesFromMessageId
);

module.exports = router;
