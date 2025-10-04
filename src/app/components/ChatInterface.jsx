"use client";
import { useEffect, useState, useRef } from "react";
import { Send, Plus, FileText, Image, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import ActionIcons from "./ActionIcons";
import Loader from "./Loader";
import { FaCircleNotch } from "react-icons/fa";

export default function ChatInterface({ initialMessage }) {
  const [messages, setMessages] = useState([
    { role: "user", content: "Hey Opus, what is the stock price today?" },
    {
      role: "ai",
      content:
        "Hello! Could you tell me the company or ticker symbol? For example, AAPL for Apple or TSLA for Tesla.",
    },
  ]);
  const [message, setMessage] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const chatEndRef = useRef(null);

  const menuItems = [
    { icon: FileText, label: "Generate Report", color: "text-purple-400" },
    { icon: Sparkles, label: "AI Suggestion", color: "text-yellow-400" },
  ];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Automatically add initialMessage to chat
  useEffect(() => {
    if (initialMessage) {
      setMessage(initialMessage);
    }
  }, [initialMessage]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    // Push user message
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setMessage("");

    // Push placeholder assistant message for loader
    setMessages((prev) => [...prev, { role: "ai", content: "" }]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: message }),
      });
      const data = await res.json();

      // Replace loader with actual AI response
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "ai", content: data.result };
        return updated;
      });
    } catch (error) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: "⚠️ Failed to fetch AI response",
        };
        return updated;
      });
    }
  };

  return (
    <div className="mx-auto w-full h-[80vh] rounded-lg bg-black overflow-hidden flex flex-col relative">
      <h1 className="text-white text-center text-3xl font-bold py-4 mt-4">
        Chat With Me
      </h1>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 space-y-4 mb-24 chat-scroll">
        {messages.map((msg, index) =>
          msg.role === "user" ? (
            // User bubble
            <div key={index} className="flex items-start gap-3 justify-end">
              <div className="flex-1 flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-4xl text-right text-xl">
                  {msg.content}
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                U
              </div>
            </div>
          ) : !msg.content ? (
            // Loader bubble (when assistant is typing)
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <FaCircleNotch className="text-white"/>
              </div>
              <div className="flex-1">
                <Loader /> {/* ✅ Shows while waiting */}
              </div>
            </div>
          ) : (
            // Assistant bubble (after response is ready)
            <div key={index} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                 <FaCircleNotch className="text-white"/>
              </div>
              <div className="flex-1">
                <span className="text-blue-400 font-semibold text-xl">Opus</span>
                <div className="text-gray-200 rounded-2xl px-6 py-4 mt-1 max-w-4xl text-xl shadow-lg shadow-black/50 prose prose-invert break-words">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                    {msg.content}
                  </ReactMarkdown>
                  <div className="flex items-center gap-2 py-2">
                    <div className="w-[40px] border-t border-blue-200/20 gap-2"></div>
                    <ActionIcons textToCopy={msg.content} />
                  </div>
                </div>
              </div>
            </div>
          )
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Chat Input Area */}
      <div className="fixed bottom-4 left-[100px] right-[100px] z-20">
        <div className="w-full max-w-5xl mx-auto">
          {/* Menu Popup */}
          {showMenu && (
            <div className="mb-3 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-2 shadow-2xl backdrop-blur-sm">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition group"
                  onClick={() => {
                    setMessage(`${item.label}: Describe what you'd like me to do...`);

                    setShowMenu(false);
                  }}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 group-hover:bg-white/10 transition ${item.color}`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span className="text-gray-300 font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Container */}
          <div className="w-full h-[100px] flex items-center bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-3 shadow-2xl">
            {/* Plus Icon with Menu */}
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition ${
                showMenu
                  ? "bg-blue-600 text-white"
                  : "bg-white/5 hover:bg-white/10 text-gray-300"
              }`}
            >
              <Plus
                className={`w-5 h-5 transition-transform ${showMenu ? "rotate-45" : ""}`}
              />
            </button>

            {/* Textarea */}
            <textarea
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 mx-3 bg-transparent text-white resize-none outline-none placeholder-gray-500 text-xl py-2 max-h-[70px] overflow-y-auto"
              onKeyDown={(e) =>
                e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())
              }
            />

            {/* Send button */}
            <button
              onClick={sendMessage}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium transition shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!message.trim()}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
