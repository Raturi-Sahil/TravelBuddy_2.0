import mongoose, { Schema } from "mongoose";

import { IActivity } from "../interfaces/activityInterface";

const geoPointSchema = new Schema({
  type: { type: String, enum: ["Point"], default: "Point" },
  coordinates: { type: [Number], default: [0, 0] },
});

const inviteSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Rejected"],
      default: "Pending",
    },
  },
  { _id: false }
);

const activitySchema = new Schema<IActivity>({
  title: { type: String, required: true },
  description: { type: String },

  category: { type: String, required: true },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  date: { type: Date, required: true },
  startTime: { type: Date },
  endTime: { type: Date },

  location: geoPointSchema,

  photos: [{ type: String }],
  videos: [{ type: String }],

  gender: {
    type: String,
    enum: ["Male", "Female"],
  },

  price: { type: Number, default: 0 },
  foreignerPrice: { type: Number },

  maxCapacity: { type: Number, required: true },

  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ],

  invitedUsers: [inviteSchema],

  groupExists: { type: Boolean, default: false },

  createdAt: { type: Date, default: Date.now },
});

activitySchema.index({ location: "2dsphere" });

export const Activity = mongoose.model<IActivity>(
  "Activity",
  activitySchema
);
