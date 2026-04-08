import React, { useState, useEffect } from "react";
import { LogOut, X } from "lucide-react";
import { useAuth } from "../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Sidebar({ currentChatId, setCurrentChatId, onClose }) {
  const [chats, setChats] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  const [authUser, setAuthUser] = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://deepseek-ai-clone-zexi.onrender.com";
        const { data } = await axios.get(`${backendUrl}/api/v1/chat`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setChats(data);
      } catch (error) {
        console.error("Error fetching chats", error);
        if (error?.response?.status === 401) {
          setAuthUser(null);
          navigate("/login");
        }
      }
    };
    fetchChats();
  }, [currentChatId, setAuthUser, navigate]);

  const handleLogout = async () => {
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "https://deepseek-ai-clone-zexi.onrender.com";
      const { data } = await axios.get(
        `${backendUrl}/api/v1/user/logout`,
        {
          withCredentials: true,
        }
      );

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      alert(data.message);

      setAuthUser(null);
      navigate("/login");
    } catch (error) {
      alert(error?.response?.data?.errors || "Logout Failed");
    }
  };

  return (
    <div className="h-full flex flex-col justify-between p-4">
      {/* Header */}
      <div>
        <div className="flex border-b border-gray-600 p-2 justify-between items-center mb-4">
          <div className="text-2xl font-bold text-gray-200">deepseek</div>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-400 md:hidden" />
          </button>
        </div>

        {/* History */}
        <div className=" flex-1 overflow-y-auto px-4 py-3 space-y-2">
          <button onClick={() => setCurrentChatId(null)} className=" w-full bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl mb-4">
            + New Chat
          </button>
          {chats.length === 0 ? (
            <div className=" text-gray-500 text-sm mt-20 text-center">
              No chat history yet
            </div>
          ) : (
            chats.map((chat) => (
              <div 
                key={chat._id} 
                onClick={() => setCurrentChatId(chat._id)}
                className={`p-2 rounded-lg cursor-pointer text-sm truncate ${currentChatId === chat._id ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                {chat.title}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-1 border-t border-gray-600">
        <div className="flex  items-center gap-2 cursor-pointer my-3">
          <img
            src="https://i.pravatar.cc/32"
            alt="profile"
            className="rounded-full w-8 h-8"
          />
          <span className="text-gray-300 font-bold">
            {user ? user?.firstName : "My Profile"}
          </span>
        </div>

        {authUser ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-700 duration-300 transition"
          >
            <LogOut className="" />
            Logout
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="w-full flex items-center justify-center gap-2 text-white bg-blue-600 font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 duration-300 transition"
          >
            Login / Signup
          </button>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
