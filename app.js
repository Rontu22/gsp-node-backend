const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const socketManager = require("./socket/socket-manager");

// Create the Express app
const app = express();
app.use(function (req, res, next) {
  // const allowedOrigins = "*";
  // const origin = req.headers.origin;
  // if (allowedOrigins.includes(origin)) {
  //   res.setHeader("Access-Control-Allow-Origin", origin);
  // }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
app.use(cors()); // Cross-origin resource sharing

const http = require("http").Server(app);
const io = require("socket.io")(http);
socketManager.initialize(io);

app.get("/", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "view/v3/index.html";
  res.sendFile(fileName, options);
});

io.on("connection", (socket) => {
  console.log("A User Connected : ", socket.id);

  socket.on("join", (userId) => {
    // Associate the socket ID with the user ID
    socket.userId = userId;
    socket.join(userId);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected : ", socket.id);
  });
});

// Middleware

app.use(morgan("dev")); // Logging
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chats");
const groupRoutes = require("./routes/groups");
const usersRoute = require("./routes/users");
app.use("/api/v1/auth", authRoutes); // Mount your API routes
app.use("/api/v1/chats", chatRoutes); // Mount your API routes
app.use("/api/v1/groups", groupRoutes); // Mount your API routes
app.use("/api/v1/users", usersRoute); // Mount your API routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = { io, app, http }; // Export the Express app
