import { Router } from "express";

import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getMyPosts,
  getNearbyPosts,
  getPostById,
  getPosts,
  getPostsByTags,
  incrementShare,
  toggleLike,
  updatePost,
} from "../controller/postController";
import { requireProfile } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// Apply auth middleware to all routes
router.use(requireProfile);

// Core CRUD
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 10 },
    { name: "videos", maxCount: 3 },
  ]),
  createPost
);
router.get("/", getPosts);
router.get("/my-posts", getMyPosts); // Get posts created by authenticated user
router.get("/nearby", getNearbyPosts);
router.get("/tags", getPostsByTags);
router.get("/:id", getPostById);
router.put("/:id", updatePost);
router.delete("/:id", deletePost);

// Engagement actions
router.post("/:id/like", toggleLike);
router.post("/:id/share", incrementShare);

// Comments
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

export default router;
