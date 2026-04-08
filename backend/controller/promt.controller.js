import OpenAI from "openai";
import { Promt } from "../model/promt.model.js";
import { Chat } from "../model/chat.model.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
export const sendPromt = async (req, res) => {
  const { content, chatId, imageBase64 } = req.body;
  const userId = req.userId;

  if (!content || content.trim() === "") {
    return res.status(400).json({ errors: "Promt content is required" });
  }
  try {
    let currentChatId = chatId;
    if (!currentChatId) {
      const newChat = await Chat.create({ userId, title: content.substring(0, 30) });
      currentChatId = newChat._id;
    }

    // save user promt
    const userPromt = await Promt.create({
      userId,
      chatId: currentChatId,
      role: "user",
      content,
    });

    const previousPrompts = await Promt.find({ chatId: currentChatId }).sort({ createdAt: 1 });
    const messages = previousPrompts.map(p => ({ role: p.role, content: p.content }));

    // If an image was attached this turn, format the last message for Vision
    if (imageBase64) {
      messages[messages.length - 1].content = [
        { type: "text", text: content },
        { type: "image_url", image_url: { url: imageBase64 } }
      ];
    }

    // send to openAI
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-4o-mini",
    });
    const aiContent = completion.choices[0].message.content;

    // save assistant promt
    const aiMessage = await Promt.create({
      userId,
      chatId: currentChatId,
      role: "assistant",
      content: aiContent,
    });
    return res.status(200).json({ reply: aiContent, chatId: currentChatId });
  } catch (error) {
    console.log("Error in Promt: ", error);
    return res
      .status(500)
      .json({ error: "Something went wrong with the AI response" });
  }
};