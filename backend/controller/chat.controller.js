import { Chat } from "../model/chat.model.js";
import { Promt } from "../model/promt.model.js";

export const getChats = async (req, res) => {
  try {
    const userId = req.userId;
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    return res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats: ", error);
    return res.status(500).json({ error: "Failed to fetch chats" });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    
    // Ensure chat belongs to user
    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const messages = await Promt.find({ chatId }).sort({ createdAt: 1 });
    return res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages: ", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;
    
    const chat = await Chat.findOneAndDelete({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }
    
    // Also delete all promts associated with this chat
    await Promt.deleteMany({ chatId });
    
    return res.status(200).json({ message: "Chat deleted properly" });
  } catch (error) {
    console.error("Error deleting chat: ", error);
    return res.status(500).json({ error: "Failed to delete chat" });
  }
};
