import { Router } from "express";

import { deleteAllNotifications,getNotifications, markAllAsRead, markAsRead } from "../controller/notificationController";
import { requireProfile } from "../middlewares/authMiddleware";

const router = Router();

router.get('/', requireProfile, getNotifications);
router.delete('/', requireProfile, deleteAllNotifications);
router.put('/:id/read', requireProfile, markAsRead);
router.put('/read-all', requireProfile, markAllAsRead);

export default router;
