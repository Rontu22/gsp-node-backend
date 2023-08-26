const messageList = document.getElementById("messageList");
const messageInput = document.getElementById("messageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");

sendMessageBtn.addEventListener("click", async () => {
  const groupId = 1; // Change to your group ID
  const message = messageInput.value;
  const recipientId = 2; // Change to recipient's ID
  const recipientName = "test-2"; // Change to recipient's name
  const senderId = 1; // Change to sender's ID
  const senderName = "ONE"; // Change to sender's name

  const response = await fetch(
    "http://localhost:5008/api/v1/chats/send-message",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        groupId,
        message,
        recipientId,
        recipientName,
        senderId,
        senderName,
      }),
    }
  );

  if (response.ok) {
    messageInput.value = "";
    // fetchLatestMessages();
  } else {
    console.error("Failed to send message");
  }
});

async function fetchLatestMessages() {
  const response = await fetch(
    "http://localhost:5008/api/v1/chats/get-all-messages"
  );
  const messages = await response.json();

  // Clear existing messages
  messageList.innerHTML = "";

  // Display messages
  messages.forEach((message) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message";
    messageDiv.textContent = `${message.senderName}: ${message.message}`;
    messageList.appendChild(messageDiv);
  });
}

// Fetch initial messages on page load
// fetchLatestMessages();
