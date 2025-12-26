import mongoose, { Schema } from "mongoose";

import { IChatGroup } from "../interfaces/chatGroupInterface";

const chatGroupSchema = new Schema<IChatGroup>(
  {
    activityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
      unique: true, // one chat per activity (IMPORTANT)
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    lastMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

export const ChatGroup = mongoose.model<IChatGroup>(
  "ChatGroup",
  chatGroupSchema
);
