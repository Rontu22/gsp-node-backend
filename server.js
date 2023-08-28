const { app, server } = require("./app"); // Import the Express app
// const socketApp = require("./socket");
const PORT = process.env.PORT || 5008;
const SOCKET_PORT = process.env.SOCKET_PORT || 8082;

app.listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
});

server.listen(SOCKET_PORT || 8082, () => {
  console.log(`Socket Server is listening on port ${SOCKET_PORT}`);
});
