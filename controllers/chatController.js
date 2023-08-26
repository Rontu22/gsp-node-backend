// create group : name, description, members id
// edit group : id, name, description, members id
// add group members : groupId, members id
// create group : create topic in redis

const db = require("../database/index");
// chatController.js

const Redis = require("ioredis");

// Create a Redis client
const redisClient = new Redis();

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

    // Publish the message to the Redis pub-sub topic (groupId)
    const messageData = {
      groupId,
      message,
      senderId,
      senderName,
    };
    redisClient.publish(groupId.toString(), JSON.stringify(messageData));

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.realTimeMessages = async (req, res) => {
  try {
    const { recipientId } = req.params;

    // Create a Redis subscriber for the recipient's channel using ioredis
    const redisSubscriber = new Redis();
    const recipientChannel = recipientId.toString(); // Update this to the appropriate recipient channel format
    await redisSubscriber.subscribe(recipientChannel);

    // Handle incoming messages for the recipient
    redisSubscriber.on("message", (channel, message) => {
      if (channel === recipientChannel) {
        const {
          senderId,
          senderName,
          message: receivedMessage,
        } = JSON.parse(message);
        res.json({ senderId, senderName, message: receivedMessage });
      }
    });

    // Unsubscribe and close the Redis subscriber when the response is finished
    res.on("finish", async () => {
      await redisSubscriber.unsubscribe();
      await redisSubscriber.quit();
    });
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
