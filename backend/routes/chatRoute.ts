import express from "express";

import {
  getConversations,
  getMessages,
  markAsRead,
  sendMessage,
} from "../controller/chatController";
import { requireProfile } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = express.Router();

// All routes require authentication
router.use(requireProfile);

// Get all conversations
router.get("/conversations", getConversations);

// Get messages with a specific user
router.get("/messages/:otherUserId", getMessages);

// Send a message to a user (supports file uploads)
router.post("/send/:receiverId", upload.single("attachment"), sendMessage);

// Mark messages from a user as read
router.put("/read/:senderId", markAsRead);

export default router;

