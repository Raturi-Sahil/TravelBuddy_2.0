import { Router } from "express";

import { getNearbyTravelers, getProfile, registerUser, updateProfile } from "../controller/userController";
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

export default router;
