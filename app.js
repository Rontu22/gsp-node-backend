const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const socketManager = require("./socket/socket-manager");
const http = require("http");

// Create the Express app
const app = express();

const { Server } = require("socket.io");
app.use(cors()); // Cross-origin resource sharing
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
// app.use(function (req, res, next) {
//   const allowedOrigins = [
//     "https://localhost:8888",
//     "https://localhost:5000",
//     "http://localhost:5000",
//   ];
//   const origin = req.headers.origin;
//   if (allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, OPTIONS, PUT, PATCH, DELETE"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "X-Requested-With,content-type"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", true);
//   next();
// });

// const io = require("socket.io")(http);
socketManager.initialize(io);

// server.listen(8082, () => console.log("Server running on port 8082"));

app.get("/", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "view/v3/index2.html";
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
const adminRoute = require("./routes/admin");
const profileRoute = require("./routes/profile");
app.use("/api/v1/auth", authRoutes); // Mount your API routes
app.use("/api/v1/chats", chatRoutes); // Mount your API routes
app.use("/api/v1/groups", groupRoutes); // Mount your API routes
app.use("/api/v1/users", usersRoute); // Mount your API routes
app.use("/api/v1/admin", adminRoute); // Mount your API routes
app.use("/api/v1/profile", profileRoute); // Mount your API routes

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

module.exports = { io, app, http, server }; // Export the Express app
