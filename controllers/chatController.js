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
// chatRoute.on("connection", async (socket) => {
//   const recipientChannel = `Group-1`;
//   await redisSubscriber.subscribe(recipientChannel);

//   // Handle incoming messages for the recipient
//   redisSubscriber.on("message", (channel, message) => {
//     console.log("Channel is created : ", channel);
//     socket.broadcast.emit(`${channel}`, { data: message });
//   });

//   socket.on("disconnect", async () => {
//     console.log("User Disconnected : ", socket.id);
//   });
// });

// chatRoute.on("connection", async (socket) => {
//   socket.on("subscribeToChannels", async (data) => {
//     const { channels } = data;

//     // Subscribe to the channels
//     channels.forEach(async (channel) => {
//       console.log("Channel is created : 2 ", channel);
//       await redisSubscriber.subscribe(channel);

//       redisSubscriber.on("message", (channel, message) => {
//         console.log("Channel is created : ", channel);
//         socket.broadcast.emit(channel, { data: message });
//       });
//     });

//     socket.on("disconnect", async () => {
//       console.log("User Disconnected : ", socket.id);
//     });
//   });
// });

// chatRoute.on("connection", async (socket) => {
//   let subscribedChannels = [];

//   socket.on("subscribeToChannels", async (data) => {
//     const { channels } = data;

//     // Unsubscribe from previously subscribed channels
//     subscribedChannels.forEach((channel) => {
//       redisSubscriber.unsubscribe(channel);
//     });

//     // Subscribe to the new list of channels
//     subscribedChannels = channels;
//     subscribedChannels.forEach(async (channel) => {
//       await redisSubscriber.subscribe(channel);
//     });

//     // Send the list of subscribed channels back to the client
//     socket.emit("subscribedChannels", { channels: subscribedChannels });

//     socket.on("disconnect", async () => {
//       console.log("User Disconnected : ", socket.id);
//     });
//   });

//   // Handle incoming messages for all subscribed channels
//   redisSubscriber.on("message", (channel, message) => {
//     if (subscribedChannels.includes(channel)) {
//       ioInstance.to(socket.id).emit(channel, { data: message });
//     }
//   });
// });

const subscriptions = {};

chatRoute.on("connection", async (socket) => {
  socket.on("subscribeToChannels", async (data) => {
    const { clientId, channels } = data;
    console.log("Channels : ", channels);
    console.log("Client ID : ", clientId);

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
    console.log("Channel : ", channel);
    console.log("Client ID : ", clientId);

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

// This is a realtime route :
// io.on("connection", (socket) => {
//   console.log("A user connected 2");

//   socket.on("disconnect", () => {
//     console.log("A user disconnected");
//   });
// });

exports.realTimeMessages = async (req, res) => {};

// exports.realTimeMessages = async (req, res) => {
//   try {
//     const { recipientId } = req.params;

//     io.to(recipientId).emit("join", recipientId);

//     // Create a Redis subscriber for the recipient's channel using ioredis
//     const redisSubscriber = new Redis();
//     const recipientChannel = recipientId.toString(); // Update this to the appropriate recipient channel format
//     await redisSubscriber.subscribe(recipientChannel);

//     // Handle incoming messages for the recipient
//     redisSubscriber.on("message", (channel, message) => {
//       if (channel === recipientChannel) {
//         const {
//           senderId,
//           senderName,
//           message: receivedMessage,
//         } = JSON.parse(message);
//         io.to(recipientId).emit("newMessage", {
//           senderId,
//           senderName,
//           message: receivedMessage,
//         });
//         // res.json({ senderId, senderName, message: receivedMessage });
//       }
//     });

//     // Unsubscribe and close the Redis subscriber when the response is finished
//     res.on("finish", async () => {
//       await redisSubscriber.unsubscribe();
//       await redisSubscriber.quit();
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

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

exports.getAllMessagesFromStartDate = async (req, res) => {
  try {
    const data = req.body;
    const { startDate } = data;
    const query = "SELECT * FROM chats WHERE sentTime >= ?";
    const [messages] = await db.query(query, [startDate]);
    if (!messages) {
      return res.status(404).json({ message: "Messages not found" });
    }
    res.json(messages);
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
