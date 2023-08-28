const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// send-message
router.post("/send-message", chatController.sendMessage);

router.post("/update-message", chatController.updateMessage);

router.get("/get-all-messages", chatController.getAllMessages);

router.get("/real-time-messages", chatController.realTimeMessages);

router.get("/get-message-by-id/:id", chatController.getMessageById);

router.post(
  "/get-all-messages-from-start-date",
  chatController.getAllMessagesFromStartDate
);

router.get("/receive-last-message", chatController.receiveLastMessage);

router.get(
  "/get-all-messages-from-message-id",
  chatController.getAllMessagesFromMessageId
);

module.exports = router;
