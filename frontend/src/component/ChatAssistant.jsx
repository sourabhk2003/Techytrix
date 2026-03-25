import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiRobot2Fill, RiSendPlane2Fill } from "react-icons/ri";
import { IoClose } from "react-icons/io5";
import axios from "axios";
import { serverUrl } from "../App";

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [model, setModel] = useState("Gemini");
  const [messages, setMessages] = useState([
    { text: "Hello! I am your AI assistant. How can I help you today?", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { text: userMessage, isUser: true }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${serverUrl}/api/chat`,
        { message: userMessage, model },
        { withCredentials: true }
      );

      setMessages((prev) => [
        ...prev,
        { text: data.message || "No response received.", isUser: false },
      ]);
    } catch (e) {
      const errorMsg = e.response?.data?.message || e.message || "Error connecting to AI service.";
      setMessages((prev) => [
        ...prev,
        { text: errorMsg, isUser: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[350px] sm:w-[400px] h-[500px] bg-[#0b0f19] border border-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-indigo-900 to-[#121829] flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-2">
                <RiRobot2Fill className="text-indigo-400 w-6 h-6 animate-pulse" />
                <div>
                  <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-indigo-300">Powered by {model}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-black/40 text-gray-200 text-xs px-2 py-1 rounded-lg border border-gray-700 outline-none cursor-pointer focus:border-indigo-500"
                >
                  <option value="Gemini">Gemini</option>
                  <option value="ChatGPT">ChatGPT</option>
                  <option value="Claude">Claude</option>
                </select>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm break-words ${
                      msg.isUser
                        ? "bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-tr-none shadow-md"
                        : "bg-gray-800/60 backdrop-blur-md text-gray-200 border border-gray-700/30 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800/60 px-4 py-2.5 rounded-2xl text-gray-400 text-sm animate-pulse">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t border-gray-800 bg-black/30 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-gray-200 outline-none focus:border-indigo-500 transition"
              />
              <button
                onClick={handleSend}
                disabled={loading}
                className={`p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"
                }`}
              >
                <RiSendPlane2Fill className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-200"
      >
        <RiRobot2Fill className="w-6 h-6" />
      </button>
    </div>
  );
};

export default ChatAssistant;
