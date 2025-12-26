import { Router } from "express";

import {
  getGroupChatByActivity,
  getGroupChatMessages,
  sendGroupChatMessage,
} from "../controller/groupChatController";
import { requireProfile } from "../middlewares/authMiddleware";

const router = Router();

// all group chat routes require auth
router.use(requireProfile);

// fetch group chat by activity
router.get("/activity/:activityId", getGroupChatByActivity);

// messages
router.post("/:chatId/messages", sendGroupChatMessage);
router.get("/:chatId/messages", getGroupChatMessages);

export default router;
