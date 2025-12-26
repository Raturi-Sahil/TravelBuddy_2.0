import express from "express";

import {
  getConversations,
  getMessages,
  markAsRead,
  sendMessage,
} from "../controller/chatController";
import { requireProfile } from "../middlewares/authMiddleware";

const router = express.Router();

// All routes require authentication
router.use(requireProfile);

// Get all conversations
router.get("/conversations", getConversations);

// Get messages with a specific user
router.get("/messages/:otherUserId", getMessages);

// Send a message to a user
router.post("/send/:receiverId", sendMessage);

// Mark messages from a user as read
router.put("/read/:senderId", markAsRead);

export default router;
