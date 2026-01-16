import mongoose, { Schema } from "mongoose";

import { VEHICLE_TYPES, PRICE_TYPES, LISTING_STATUS, TRANSPORT_FEATURES } from "../data/enums";
import { ITransport, ITransportReview, ITransportContact } from "../interfaces/transportInterface";

// Transport Schema
const transportSchema = new Schema<ITransport>(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Vehicle Details
    vehicleType: {
      type: String,
      enum: VEHICLE_TYPES,
      required: true,
    },
    vehicleName: { type: String, required: true },
    vehicleNumber: { type: String },
    seatingCapacity: { type: Number, required: true, min: 1 },
    vehicleImages: [{ type: String }],

    // Route & Service
    route: { type: String, required: true },
    serviceArea: { type: String, required: true },
    serviceAreaCoordinates: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },

    // Pricing
    minPrice: { type: Number, required: true, min: 0 },
    maxPrice: { type: Number, min: 0 },
    priceType: {
      type: String,
      enum: PRICE_TYPES,
      default: "per_trip",
    },

    // Contact
    phone: { type: String, required: true },
    whatsapp: { type: String },

    // Additional Info
    features: [{ type: String, enum: TRANSPORT_FEATURES }],
    languages: [{ type: String }],
    description: { type: String },

    // Status
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    listingStatus: {
      type: String,
      enum: LISTING_STATUS,
      default: "pending",
    },
    rejectionReason: { type: String },

    // Stats
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    totalContacts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
transportSchema.index({ serviceAreaCoordinates: "2dsphere" });
transportSchema.index({ owner: 1 });
transportSchema.index({ vehicleType: 1, isActive: 1 });
transportSchema.index({ serviceArea: "text", route: "text" });
transportSchema.index({ averageRating: -1 });
transportSchema.index({ listingStatus: 1 });

export const Transport = mongoose.model<ITransport>("Transport", transportSchema);

// Transport Review Schema
const transportReviewSchema = new Schema<ITransportReview>(
  {
    transport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
      required: true,
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

transportReviewSchema.index({ transport: 1, createdAt: -1 });
transportReviewSchema.index({ transport: 1, reviewer: 1 }, { unique: true }); // One review per user per transport

export const TransportReview = mongoose.model<ITransportReview>("TransportReview", transportReviewSchema);

// Transport Contact Log Schema (for analytics)
const transportContactSchema = new Schema<ITransportContact>(
  {
    transport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transport",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contactType: {
      type: String,
      enum: ["call", "whatsapp"],
      required: true,
    },
  },
  { timestamps: true }
);

transportContactSchema.index({ transport: 1, createdAt: -1 });

export const TransportContact = mongoose.model<ITransportContact>("TransportContact", transportContactSchema);
