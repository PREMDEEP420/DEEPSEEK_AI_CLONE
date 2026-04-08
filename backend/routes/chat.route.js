import express from "express";
import { getChats, getChatMessages, deleteChat } from "../controller/chat.controller.js";
import userMiddleware from "../middleware/user.middleware.js";

const router = express.Router();

router.use(userMiddleware);

router.get("/", getChats);
router.get("/:chatId/messages", getChatMessages);
router.delete("/:chatId", deleteChat);

export default router;
