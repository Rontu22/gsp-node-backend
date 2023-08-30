// create group : name, description, members id
// edit group : id, name, description, members id
// add group members : groupId, members id
// create group : create topic in redis

const db = require("../database/index");

const Redis = require("ioredis");

// Create a Redis client
const redisClient = new Redis();
const redisSubscriber = new Redis();
const socketManager = require("../socket/socket-manager");
const ioInstance = socketManager.getIoInstance();

const chatRoute = ioInstance.of("/chat");

chatRoute.on("connection", async (socket) => {
  console.log("A User Connected : ", socket.id);
  socket.on("subscribeToChannels", async (data) => {
    const { clientId, channels } = data;

    // Subscribe to the Redis channels
    channels.forEach(async (channel) => {
      await redisSubscriber.subscribe(channel);
    });

    redisSubscriber.on("message", (channel, message) => {
      if (channels.includes(channel)) {
        socket.emit(channel, { data: JSON.parse(message) });
      }
    });

    socket.on("disconnect", async () => {
      console.log("User Disconnected : ", socket.id);
      // Remove the client's subscriptions and unsubscribe from Redis channels
    });
  });
});

const chatGroupRoute = ioInstance.of("/chat-group");
chatGroupRoute.on("connection", async (socket) => {
  socket.on("subscribeToChannels", async (data) => {
    const { clientId, channel } = data;

    // Subscribe to the Redis channel
    await redisSubscriber.subscribe(channel);

    redisSubscriber.on("message", (groupChannel, message) => {
      if (channel === groupChannel) {
        socket.emit(channel, { data: JSON.parse(message) });
      }
    });

    socket.on("disconnect", async () => {
      console.log("User Disconnected : ", socket.id);
      // Remove the client's subscriptions and unsubscribe from Redis channels
    });
  });
});

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

    const insertedData = await db.query(query, [
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
      messageId: insertedData[0].insertId,
      messageType: "CREATED",
    };
    const groupName = `Group-${groupId}`;
    console.log("HERE : ", groupName);

    redisClient.publish(groupName, JSON.stringify(messageData));

    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { messageId, message, groupId } = req.body;

    const query = `
      UPDATE chats
      SET message = ?
      WHERE id = ?
    `;

    await db.query(query, [message, messageId]);

    // Publish the message to the Redis pub-sub topic (groupId)
    const messageData = {
      message,
      messageId,
      messageType: "UPDATED",
    };
    console.log("Message Id : ", messageId);

    // find group id from chats table if not provided

    console.log("groupId : ", groupId);
    const groupName = `Group-${groupId}`;

    redisClient.publish(groupName, JSON.stringify(messageData));

    res.status(201).json({ message: "Message updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllMessages = async (req, res) => {
  try {
    const { groupId } = req.query;
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;

    const query = "SELECT * FROM chats WHERE groupId = ? LIMIT ? OFFSET ?";
    const [messages] = await db.query(query, [groupId, limit, offset]);
    return res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getMessageById = async (req, res) => {
  try {
    const messageId = req.params.id;

    const query = "SELECT * FROM chats WHERE id = ? limit 1";
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

exports.getAllMessagesFromStartDate = async (req, res) => {
  try {
    const data = req.body;
    const { startDate, groupId } = data;
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;

    const query =
      "SELECT * FROM chats WHERE sentTime >= ? and groupId = ? LIMIT ? OFFSET ?";
    const [messages] = await db.query(query, [
      startDate,
      groupId,
      limit,
      offset,
    ]);
    if (!messages) {
      return res.status(404).json({ message: "Messages not found" });
    }
    return res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.receiveLastMessage = async (req, res) => {
  try {
    const { groupId } = req.query;
    const query =
      "SELECT * FROM chats where groupId = ? ORDER BY sentTime DESC LIMIT 1";
    const [lastMessage] = await db.query(query, [groupId]);
    res.json(lastMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllMessagesFromMessageId = async (req, res) => {
  try {
    const { messageId, groupId } = req.query;
    const limit = parseInt(req.query.limit) || 1000;
    const offset = parseInt(req.query.offset) || 0;

    const query =
      "SELECT * FROM chats WHERE id >= ? and groupId = ? LIMIT ? OFFSET ?";
    const [messages] = await db.query(query, [
      messageId,
      groupId,
      limit,
      offset,
    ]);
    if (!messages) {
      return res.status(404).json({ message: "Messages not found" });
    }
    return res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
