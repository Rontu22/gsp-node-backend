const messageList = document.getElementById("messageList");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

// WebSocket connection
const socket = new WebSocket(
  "ws://localhost:5008/api/v1/chats/real-time-messages"
); // Update with your WebSocket server URL

socket.addEventListener("open", () => {
  console.log("WebSocket connection established");
});

socket.addEventListener("message", (event) => {
  const messageData = JSON.parse(event.data);
  displayMessage(messageData.senderName, messageData.message);
});

// Function to display received messages
function displayMessage(senderName, message) {
  const messageDiv = document.createElement("div");
  messageDiv.className = "message";
  messageDiv.textContent = `${senderName}: ${message}`;
  messageList.appendChild(messageDiv);
}

// Send message on button click
sendMessageBtn.addEventListener("click", () => {
  socket.send(
    JSON.stringify({
      groupId: 1,
      message: messageInput.value,
      recipientId: 2,
      recipientName: "test-2",
      senderId: 1,
      senderName: "ONE",
    })
  );
  messageInput.value = "";
});
