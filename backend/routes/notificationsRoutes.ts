import { Router } from "express";
import { requireProfile } from "../middlewares/authMiddleware";
import { getNotifications, markAsRead, markAllAsRead, deleteAllNotifications } from "../controller/notificationController";

const router = Router();

router.get('/', requireProfile, getNotifications);
router.delete('/', requireProfile, deleteAllNotifications);
router.put('/:id/read', requireProfile, markAsRead);
router.put('/read-all', requireProfile, markAllAsRead);

export default router;
