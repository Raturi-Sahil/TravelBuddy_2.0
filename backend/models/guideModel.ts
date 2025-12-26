import mongoose, { Schema } from "mongoose";

import { GUIDE_SPECIALTIES, LANGUAGE_LEVELS } from "../data/enums";
import { IGuide, IGuideBooking, IGuideReview } from "../interfaces/guideInterface";

// Guide Schema
const availabilitySchema = new Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
  },
  { _id: false }
);

const guideSchema = new Schema<IGuide>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true }, // Auto-approve for MVP
    
    city: { type: String, required: true },
    cityCoordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
    
    specialties: [{ type: String, enum: GUIDE_SPECIALTIES }],
    languages: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: LANGUAGE_LEVELS, default: "Intermediate" },
      },
    ],
    
    pricePerHour: { type: Number, required: true, min: 0 },
    experience: { type: Number, default: 0, min: 0 },
    
    bio: { type: String, default: "" },
    coverImages: [{ type: String }],
    
    availability: [availabilitySchema],
    
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalBookings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

guideSchema.index({ cityCoordinates: "2dsphere" });
guideSchema.index({ city: 1, isActive: 1 });
guideSchema.index({ averageRating: -1 });

export const Guide = mongoose.model<IGuide>("Guide", guideSchema);

// GuideBooking Schema
const guideBookingSchema = new Schema<IGuideBooking>(
  {
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
    },
    traveler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    
    totalPrice: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending",
    },
    
    status: {
      type: String,
      enum: ["pending", "accepted", "confirmed", "completed", "cancelled"],
      default: "pending",
    },
    cancellationReason: { type: String },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    
    notes: { type: String },
  },
  { timestamps: true }
);

guideBookingSchema.index({ guide: 1, date: 1 });
guideBookingSchema.index({ traveler: 1, status: 1 });

export const GuideBooking = mongoose.model<IGuideBooking>("GuideBooking", guideBookingSchema);

// GuideReview Schema
const guideReviewSchema = new Schema<IGuideReview>(
  {
    guide: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guide",
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "GuideBooking",
      required: true,
      unique: true, // One review per booking
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

guideReviewSchema.index({ guide: 1, createdAt: -1 });

export const GuideReview = mongoose.model<IGuideReview>("GuideReview", guideReviewSchema);
