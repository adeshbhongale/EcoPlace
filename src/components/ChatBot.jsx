import React, { useState } from "react";
import { FaRobot, FaUser, FaPaperPlane, FaTimes, FaLeaf } from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";

const ChatBot = ({ onClose }) => {
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [chatError, setChatError] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  const sendMessageToChatbot = async () => {
    if (!chatInput.trim()) {
      setChatError("Please enter a message.");
      return;
    }

    setChatError("");
    setChatLoading(true);

    // Add user message immediately for better UX
    const userMessage = chatInput.trim();
    setChatHistory(prev => [...prev, { role: "user", message: userMessage }]);
    setChatInput(""); // Clear input immediately

    try {
      const response = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include", // Important for CORS
        mode: "cors", // Explicitly state CORS mode
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      
      setChatHistory(prev => [...prev, { 
        role: "bot", 
        message: data.answer || "Sorry, I couldn't process that request." 
      }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setChatHistory(prev => [...prev, { 
        role: "bot", 
        message: "Sorry, I'm having trouble connecting to the server. Please try again." 
      }]);
      setChatError(error.message || "Failed to communicate with the chatbot.");
    } finally {
      setChatLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !chatLoading) {
      sendMessageToChatbot();
    }
  };

  // Auto-scroll to bottom when new messages arrive
  const chatContainerRef = React.useRef(null);
  React.useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white rounded-2xl shadow-2xl overflow-hidden border border-green-100">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <FaRobot className="text-white text-xl" />
            </div>
            <div>
              <h3 className="font-bold text-white">EcoAssistant By Plotch.ai</h3>
              <div className="flex items-center text-xs text-green-100">
                <span className="h-2 w-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
                <span>Ready to help with sustainability</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-full transition-colors"
            aria-label="Close chat"
          >
            <FaTimes className="text-white" />
          </button>
        </div>
      </div>

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="h-[400px] overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-green-50 to-white"
        style={{ scrollBehavior: 'smooth' }}
      >
        {chatHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <div className="bg-green-100 p-6 rounded-full">
              <FaLeaf className="text-4xl text-green-600 animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-gray-700 font-medium">Welcome to EcoAssistant!</p>
              <p className="text-gray-500 text-sm">Ask me anything about sustainable living and eco-friendly products</p>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex items-end space-x-2 ${
                  chat.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {chat.role !== "user" && (
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <FaRobot className="text-green-600" />
                  </div>
                )}
                
                <div
                  className={`max-w-[75%] p-3 ${
                    chat.role === "user"
                      ? "bg-green-600 text-white rounded-t-2xl rounded-l-2xl"
                      : "bg-white shadow-md rounded-t-2xl rounded-r-2xl border border-green-100"
                  }`}
                >
                  <p className={`${chat.role === "user" ? "text-white" : "text-gray-700"} text-sm`}>
                    {chat.message}
                  </p>
                </div>

                {chat.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-white" />
                  </div>
                )}
              </div>
            ))}
            
            {chatLoading && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <FaRobot className="text-green-600" />
                </div>
                <div className="bg-white shadow-md rounded-xl p-3 flex items-center">
                  <BsThreeDots className="text-green-600 text-xl animate-pulse" />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-green-100">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              className="flex-1 px-4 py-3 rounded-xl border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
              placeholder="Ask about sustainable living..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={chatLoading}
            />
            <button
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                chatLoading
                  ? "bg-gray-200 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
              }`}
              onClick={sendMessageToChatbot}
              disabled={chatLoading}
            >
              {chatLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaPaperPlane className="text-white" />
              )}
            </button>
          </div>
          
          {chatError && (
            <div className="flex items-center space-x-2 px-2">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-500 text-sm">{chatError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
