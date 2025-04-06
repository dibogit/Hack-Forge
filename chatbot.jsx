import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const Chatbot = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const navigate = useNavigate();

  // Scroll chat to latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to send message to Flask API
  const sendMessage = async () => {
    if (!userInput.trim()) return;

    setLoading(true);
    const newMessage = { user: userInput, bot: "..." };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput }),
      });

      const data = await response.json();
      console.log("API Response:", data);

      // Handle API response
      let botReply = "⚠️ AI Error: Invalid response";
      if (Array.isArray(data) && data[0]?.generated_text) {
        botReply = data[0].generated_text;
      } else if (data.error) {
        botReply = `⚠️ Error: ${data.error}`;
      }

      setMessages((prev) => {
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = { user: userInput, bot: botReply };
        return updatedMessages;
      });

      setUserInput("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { user: userInput, bot: "⚠️ Server error. Try again later." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white px-4">
      <h1 className="text-3xl font-bold mb-4">AI Chatbot</h1>

      {/* Chat Message Box */}
      <div className="border p-4 w-full max-w-lg h-96 overflow-y-auto bg-gray-800 rounded-lg shadow-lg">
        {messages.map((msg, index) => (
          <div key={index} className="mb-3">
            <p className="text-green-400"><strong>You:</strong> {msg.user}</p>
            <p className="text-blue-300"><strong>Bot:</strong> {msg.bot}</p>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>

      {/* Input Box & Send Button */}
      <div className="flex mt-4 w-full max-w-lg">
        <input
          type="text"
          className="flex-1 p-2 text-black rounded-l-md"
          placeholder="Type your message..."
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          disabled={loading}
        />
        <button
          className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-primary/90 transition"
          onClick={sendMessage}
          disabled={loading}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate("/")}
        className="mt-6 bg-gray-700 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-gray-600 transition"
      >
        ← Back to Home
      </button>
    </div>
  );
};

export default Chatbot;
