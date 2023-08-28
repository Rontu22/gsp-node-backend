let ioInstance;

function initialize(io) {
  console.log("Connected to socket");
  ioInstance = io;
}

function getIoInstance() {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been initialized");
  }
  return ioInstance;
}

module.exports = {
  initialize,
  getIoInstance,
};
