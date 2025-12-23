import { Router } from "express";

import {
  addComment,
  createArticle,
  deleteArticle,
  deleteComment,
  getArticleById,
  getArticles,
  getArticlesByCategory,
  getMyArticles,
  incrementShare,
  toggleLike,
  updateArticle,
} from "../controller/articleController";
import { requireProfile } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// Apply auth middleware to all routes
router.use(requireProfile);

// Core CRUD
router.post(
  "/",
  upload.fields([{ name: "images", maxCount: 10 }]),
  createArticle
);
router.get("/", getArticles);
router.get("/my-articles", getMyArticles);
router.get("/category", getArticlesByCategory);
router.get("/:id", getArticleById);
router.put("/:id", updateArticle);
router.delete("/:id", deleteArticle);

// Engagement actions
router.post("/:id/like", toggleLike);
router.post("/:id/share", incrementShare);

// Comments
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;
