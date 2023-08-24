// create group : name, description, members id
// edit group : id, name, description, members id
// add group members : groupId, members id
// create group : create topic in redis

const db = require("../database/index");
// chatController.js

exports.sendMessage = async (req, res) => {
  try {
    const {
      groupId,
      message,
      recipientId,
      recipientName,
      senderId,
      senderName,
    } = req.body;

    const query = `
      INSERT INTO chats (groupId, message, recipientId, recipientName, senderId, senderName)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.query(query, [
      groupId,
      message,
      recipientId,
      recipientName,
      senderId,
      senderName,
    ]);

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const query = "SELECT * FROM chats";
    const [messages] = await db.query(query);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const messageId = req.params.id;

    const query = "SELECT * FROM chats WHERE id = ?";
    const [message] = await db.query(query, [messageId]);

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.receiveLastMessage = async (req, res) => {
  try {
    const query = "SELECT * FROM chats ORDER BY sentTime DESC LIMIT 1";
    const [lastMessage] = await db.query(query);

    res.json(lastMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllMessagesFromMessageId = async (req, res) => {
  try {
    const messageId = req.query.messageId;

    const query = "SELECT * FROM chats WHERE id >= ?";
    const [messages] = await db.query(query, [messageId]);

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
