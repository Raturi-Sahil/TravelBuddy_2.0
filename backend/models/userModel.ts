import mongoose, { Schema } from "mongoose";

import { COUNTRIES, GENDERS, INTERESTS, LANGUAGE_LEVELS, TRAVEL_STYLES } from "../data/enums";
import { IUser } from "../interfaces/userInterface";

const geoPointSchema = new Schema({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], default: [0, 0] },
});

const futureDestinationSchema = new Schema({
  name: { type: String },
  coordinates: { type: [Number], default: [0, 0] },
});

const userSchema = new Schema<IUser>({
  clerk_id: { type: String, required: true, unique: true },

  mobile: {
    type: String,
    required: true,
    unique: true,
    minlength: 10,
    maxlength: 10,
  },

  dob: { type: Date, required: true },

  gender: { type: String, enum: GENDERS, required: true },

  profileVisibility: {
      type: String,
      enum: ["Public", "Private"],
      default: "Public"
  },

  travelStyle: {
    type: String,
    enum: TRAVEL_STYLES,
    default: "Solo",
  },

  languages: [
    {
      name: String,
      level: {
        type: String,
        enum: LANGUAGE_LEVELS,
        default: "Beginner",
      },
    },
  ],

  bio: { type: String, default: "Not Updated Yet" },

  currentLocation: geoPointSchema,

  nationality: { type: String, enum: COUNTRIES, default: "Not Specified" },

  futureDestinations: [futureDestinationSchema],

  interests: [{ type: String, enum: INTERESTS }],

  socialLinks: {
    instagram: { type: String, default: "" },
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
  },

  isOnline: { type: Boolean, default: false },

  lastSeen: { type: Date, default: Date.now },

  socketId: { type: String, default: null },

  JoinActivity: [{ type: mongoose.Schema.Types.ObjectId, ref: "Activity" }],

  createdAt: { type: Date, default: Date.now },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

// --------------------------------------
// 🌍 GEO INDEXING
// --------------------------------------
userSchema.index({ currentLocation: "2dsphere" });
userSchema.index({ "futureDestinations.coordinates": "2dsphere" });

export const User = mongoose.model<IUser>("User", userSchema);
