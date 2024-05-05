const socket = io();
const sendBtn = document.getElementById("sendBtn");
const messageInput = document.getElementById("message");
const messageDisplay = document.getElementById("messageDisplay");

// Function to handle sending messages
function sendMessage() {
  const message = messageInput.value;
  socket.emit("send:message", message);
  messageInput.value = ""; // Clear input field after sending message
}

// Event listener for clicking the "Send" button
sendBtn.addEventListener("click", (e) => {
  sendMessage();
});

// Event listener for pressing Enter key
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

socket.on("message", (message) => {
  messageDisplay.innerHTML += "• " + message + "<br>";
});
