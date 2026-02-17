window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};

let chatHistory = [];

function displayMessage(sender, text) {
  const chatBox = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.className = "message " + (sender === "You" ? "user" : "ai");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const inputField = document.getElementById("userInput");
  const message = inputField.value;
  if (!message) return;

  displayMessage("You", message);
  chatHistory.push({ role: "user", content: message });
  inputField.value = "";

  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages: chatHistory })
  });

  const data = await response.json();

  displayMessage("AI", data.reply);
  chatHistory.push({ role: "assistant", content: data.reply });

  speak(data.reply);
}

function newChat() {
  chatHistory = [];
  document.getElementById("chatBox").innerHTML = "";
}

function speak(text) {
  // Stop previous speech if speaking
  window.speechSynthesis.cancel();

  const speech = new SpeechSynthesisUtterance(text);

  // Get available voices
  const voices = window.speechSynthesis.getVoices();

  // Try to select natural English voice
  const preferredVoice =
    voices.find(v => v.name.includes("Google")) ||
    voices.find(v => v.name.includes("Natural")) ||
    voices.find(v => v.lang === "en-IN") ||
    voices[0];

  if (preferredVoice) {
    speech.voice = preferredVoice;
  }

  // Make it sound more human
  speech.rate = 1;        // Speed (0.8 - 1.1 best)
  speech.pitch = 1;       // Natural tone
  speech.volume = 1;

  // Small delay for smoother speech
  setTimeout(() => {
    window.speechSynthesis.speak(speech);
  }, 200);
}


/* 🎤 Speech to Text */

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = "en-IN";

function startListening() {
  recognition.start();
}

recognition.onresult = function(event) {
  const transcript = event.results[0][0].transcript;
  document.getElementById("userInput").value = transcript;
  sendMessage();
};
