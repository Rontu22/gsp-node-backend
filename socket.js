const app = require("express")();
const http = require("http").Server(app);

const path = require("path");

const io = require("socket.io")(http);

// app.use(express.static("public"));
app.get("/", (req, res) => {
  const options = {
    root: path.join(__dirname),
  };
  const fileName = "view/v3/index2.html";
  res.sendFile(fileName, options);
});

io.on("connection", (socket) => {
  console.log("A User Connected : ", socket.id);

  socket.on("disconnect", () => {
    console.log("User Disconnected : ", socket.id);
  });
});

module.exports = http;
