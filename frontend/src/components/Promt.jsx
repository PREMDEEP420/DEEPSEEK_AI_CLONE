import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Paperclip, ArrowUp, Globe, Bot } from "lucide-react";
import logo from "../../public/logo.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow as codeTheme } from "react-syntax-highlighter/dist/esm/styles/prism";

function Promt({ currentChatId, setCurrentChatId }) {
  const [inputValue, setInputValue] = useState("");
  const [typeMessage, setTypeMessage] = useState("");
  const [fileText, setFileText] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [filePreview, setFilePreview] = useState("");

  const [promt, setPromt] = useState([]);
  const [loading, setLoading] = useState(false);
  const promtEndRef = useRef();
  const fileInputRef = useRef();

  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentChatId) {
        setPromt([]);
        return;
      }
      try {
        const token = localStorage.getItem("token");
        const backendUrl = "https://deepseek-ai-clone-zexi.onrender.com";
        const { data } = await axios.get(`${backendUrl}/api/v1/chat/${currentChatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPromt(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };
    fetchMessages();
  }, [currentChatId]);

  useEffect(() => {
    promtEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [promt, loading]);

  const handleSend = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    let content = trimmed;
    if (fileText) {
      content = `Based on this document:\n${fileText}\n\nQuestion: ${trimmed}`;
    }

    setInputValue("");
    setTypeMessage(trimmed);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://deepseek-ai-clone-zexi.onrender.com";
      const { data } = await axios.post(
        `${backendUrl}/api/v1/deepseekai/promt`,
        { content, chatId: currentChatId, imageBase64 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      if (!currentChatId && data.chatId) {
        setCurrentChatId(data.chatId);
      }

      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        { role: "assistant", content: data.reply },
      ]);
      setFileText("");
      setImageBase64("");
      setFilePreview("");
    } catch (error) {
      console.error("API Error:", error);
      setPromt((prev) => [
        ...prev,
        { role: "user", content: trimmed },
        {
          role: "assistant",
          content: "❌ Something went wrong with the AI response.",
        },
      ]);
    } finally {
      setLoading(false);
      setTypeMessage(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileText("");
    setImageBase64("");
    setFilePreview("");

    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
        setFilePreview(file.name);
      };
      reader.readAsDataURL(file);
      alert("Image attached. You can now ask questions about it.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://deepseek-ai-clone-zexi.onrender.com";
      const { data } = await axios.post(`${backendUrl}/api/v1/file/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setFileText(data.text);
      setFilePreview(file.name);
      alert("File uploaded successfully. You can now ask questions about it.");
    } catch (error) {
      console.error("File upload error:", error);
      alert("Failed to upload file.");
    }
  };

  const handlePaperclipClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="flex flex-col items-center justify-between flex-1 w-full px-4 pb-4 md:pb-8">
      {/* ➤ Greeting Section */}
      <div className="mt-8 md:mt-16 text-center">
        <div className="flex items-center justify-center gap-2">
          <img src={logo} alt="DeepSeek Logo" className="h-6 md:h-8" />
          <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">
            Hi, I'm DeepSeek.
          </h1>
        </div>
        <p className="text-gray-400 text-base md:text-sm mt-2">
          💬 How can I help you today?
        </p>
      </div>

      {/* ➤ Scrollable Chat Box */}
      <div className="w-full max-w-4xl flex-1 overflow-y-auto mt-6 mb-4 space-y-4 max-h-[60vh] px-1">
        {promt.map((msg, index) => (
          <div
            key={index}
            className={`w-full flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" ? (
              // 🧠 Full-width assistant response
              <div className="w-full bg-[#232323] text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={codeTheme}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg mt-2"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-gray-800 px-1 py-0.5 rounded"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              // 👤 User message - 30% width at top-right
              <div className="w-[30%] bg-blue-600 text-white rounded-xl px-4 py-3 text-sm whitespace-pre-wrap self-start">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* Show user's prompt while loading */}
        {loading && typeMessage && (
          <div
            className="whitespace-pre-wrap px-4 py-3 rounded-2xl text-sm break-words
           bg-blue-600 text-white self-end ml-auto max-w-[40%]"
          >
            {typeMessage}
          </div>
        )}

        {/* 🤖 Typing Indicator */}
        {loading && (
          <div className="flex justify-start w-full">
            <div className="bg-[#2f2f2f] text-white px-4 py-3 rounded-xl text-sm animate-pulse">
              🤖Loading...
            </div>
          </div>
        )}

        <div ref={promtEndRef} />
      </div>

      {/* ➤ Input Box */}
      <div className="w-full max-w-4xl relative mt-auto">
        <div className="bg-[#2f2f2f] rounded-[2rem] px-4 md:px-6 py-6 md:py-8 shadow-md">
          {filePreview && (
            <div className="mb-3 px-3 py-1.5 bg-gray-700/50 w-max rounded-md flex items-center border border-gray-600">
              <Paperclip className="w-4 h-4 mr-2 text-blue-400" />
              <span className="text-gray-300 text-sm truncate max-w-[200px]">{filePreview}</span>
              <button onClick={() => { setFilePreview(""); setFileText(""); setImageBase64(""); }} className="ml-3 text-gray-500 hover:text-red-400 text-xs">✕</button>
            </div>
          )}
          <input
            type="text"
            placeholder="💬 Message DeepSeek"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent w-full text-white placeholder-gray-400 text-base md:text-lg outline-none"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-4 gap-4">
            {/* 🛠️ Functional Buttons */}
            <div className="flex gap-2 flex-wrap">
              <button className="flex items-center gap-2 border border-gray-500 text-white text-sm md:text-base px-3 py-1.5 rounded-full hover:bg-gray-600 transition">
                <Bot className="w-4 h-4" />
                DeepThink (R1)
              </button>
              <button className="flex items-center gap-2 border border-gray-500 text-white text-sm md:text-base px-3 py-1.5 rounded-full hover:bg-gray-600 transition">
                <Globe className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* ➤ Send Button */}
            <div className="flex items-center gap-2 ml-auto">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,image/*"
                style={{ display: "none" }}
              />
              <button className="text-gray-400 hover:text-white transition" onClick={handlePaperclipClick}>
                <Paperclip className="w-5 h-5" />
              </button>
              <button
                onClick={handleSend}
                className="bg-gray-500 hover:bg-blue-600 p-2 rounded-full text-white transition"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Promt;
