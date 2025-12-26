import express from "express";

import {
  cancelBooking,
  completeBooking,
  confirmBooking,
  createBooking,
  createGuideBookingPayment,
  createGuideProfile,
  createReview,
  getGuideById,
  getGuideReviews,
  getGuides,
  getMyBookingsAsGuide,
  getMyBookingsAsTraveler,
  getMyGuideProfile,
  getNearbyGuides,
  toggleGuideStatus,
  updateGuideProfile,
  verifyGuideBookingPayment,
} from "../controller/guideController";
import { requireProfile } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = express.Router();

// Guide Profile Routes
router.post("/", requireProfile, upload.array("coverImages", 5), createGuideProfile);
router.patch("/", requireProfile, upload.array("coverImages", 5), updateGuideProfile);
router.patch("/toggle", requireProfile, toggleGuideStatus);
router.get("/my-profile", requireProfile, getMyGuideProfile);

// Browse Guides Routes
router.get("/", requireProfile, getGuides);
router.get("/nearby", requireProfile, getNearbyGuides);
router.get("/:id", requireProfile, getGuideById);

// Booking Routes
router.post("/bookings", requireProfile, createBooking);
router.get("/bookings/traveler", requireProfile, getMyBookingsAsTraveler);
router.get("/bookings/guide", requireProfile, getMyBookingsAsGuide);
router.patch("/bookings/:id/confirm", requireProfile, confirmBooking);
router.patch("/bookings/:id/cancel", requireProfile, cancelBooking);
router.patch("/bookings/:id/complete", requireProfile, completeBooking);

// Payment Routes
router.post("/bookings/:id/payment", requireProfile, createGuideBookingPayment);
router.post("/bookings/:id/verify-payment", requireProfile, verifyGuideBookingPayment);

// Review Routes
router.post("/:id/reviews", requireProfile, createReview);
router.get("/:id/reviews", requireProfile, getGuideReviews);

export default router;

