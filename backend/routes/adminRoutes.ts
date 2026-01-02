import { Router } from "express";

import {
  adminLogin,
  cancelActivity,
  deleteActivity,
  deleteArticle,
  deletePost,
  deleteUser,
  getActivities,
  getArticles,
  getDashboardStats,
  getGuideBookings,
  getGuides,
  getPosts,
  getUserById,
  getUsers,
  toggleGuideStatus,
  updateUser,
  verifyAdminToken,
  verifyGuide,
} from "../controller/adminController";
import { verifyAdmin } from "../middlewares/adminMiddleware";

const router = Router();

// Auth routes
router.post("/login", adminLogin);
router.get("/verify", verifyAdmin, verifyAdminToken);

// Dashboard
router.get("/dashboard", verifyAdmin, getDashboardStats);

// User management
router.get("/users", verifyAdmin, getUsers);
router.get("/users/:id", verifyAdmin, getUserById);
router.put("/users/:id", verifyAdmin, updateUser);
router.delete("/users/:id", verifyAdmin, deleteUser);

// Post moderation
router.get("/posts", verifyAdmin, getPosts);
router.delete("/posts/:id", verifyAdmin, deletePost);

// Article management
router.get("/articles", verifyAdmin, getArticles);
router.delete("/articles/:id", verifyAdmin, deleteArticle);

// Activity management
router.get("/activities", verifyAdmin, getActivities);
router.put("/activities/:id/cancel", verifyAdmin, cancelActivity);
router.delete("/activities/:id", verifyAdmin, deleteActivity);

// Guide management
router.get("/guides", verifyAdmin, getGuides);
router.put("/guides/:id/verify", verifyAdmin, verifyGuide);
router.put("/guides/:id/toggle-status", verifyAdmin, toggleGuideStatus);

// Guide bookings
router.get("/bookings", verifyAdmin, getGuideBookings);

export default router;
