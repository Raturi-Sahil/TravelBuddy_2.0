import express from "express";

import {
  createTransportListing,
  createTransportReview,
  deleteTransportListing,
  getMyTransportListings,
  getNearbyTransports,
  getTransportById,
  getTransportReviews,
  getTransports,
  logContact,
  toggleTransportAvailability,
  updateTransportListing,
} from "../controller/transportController";
import { requireProfile } from "../middlewares/authMiddleware";
import upload from "../middlewares/multerMiddleware";

const router = express.Router();

// Transport Listing Routes (Owner)
router.post("/", requireProfile, upload.array("vehicleImages", 5), createTransportListing);
router.patch("/:id", requireProfile, upload.array("vehicleImages", 5), updateTransportListing);
router.patch("/:id/availability", requireProfile, toggleTransportAvailability);
router.delete("/:id", requireProfile, deleteTransportListing);
router.get("/my-listings", requireProfile, getMyTransportListings);

// Browse Transports Routes
router.get("/", requireProfile, getTransports);
router.get("/nearby", requireProfile, getNearbyTransports);
router.get("/:id", requireProfile, getTransportById);

// Contact Logging (for analytics)
router.post("/:id/contact", requireProfile, logContact);

// Review Routes
router.post("/:id/reviews", requireProfile, createTransportReview);
router.get("/:id/reviews", requireProfile, getTransportReviews);

export default router;
