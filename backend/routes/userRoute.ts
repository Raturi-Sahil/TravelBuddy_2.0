import { Router } from "express";

import { getNearbyTravelers, getProfile, getUserById, registerUser, updateProfile } from "../controller/userController";
import { requireProfile,verifyClerk } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = Router();

// For form-data without files - only needs Clerk auth (no profile yet)
router.post("/register", verifyClerk, upload.none(), registerUser);

// These routes require full auth (Clerk + MongoDB profile)
router.get("/profile", requireProfile, getProfile);
router.patch("/update-profile", requireProfile, updateProfile);

// Get nearby travelers (requires auth to exclude current user)
router.get("/nearby", requireProfile, getNearbyTravelers);

// Get another user's profile by ID
router.get("/:id", requireProfile, getUserById);

export default router;

