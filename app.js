const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");

// Create the Express app
const app = express();

// Middleware
app.use(cors()); // Cross-origin resource sharing
app.use(morgan("dev")); // Logging
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chats");
const groupRoutes = require("./routes/groups");
app.use("/api/v1", authRoutes); // Mount your API routes
app.use("/api/v1/chats", chatRoutes); // Mount your API routes
app.use("/api/v1/groups", groupRoutes); // Mount your API routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = app; // Export the Express app
