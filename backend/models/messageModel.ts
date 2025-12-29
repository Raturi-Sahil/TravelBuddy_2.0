import mongoose, { Schema } from "mongoose";

import { IMessage } from "../interfaces/messageInterface";

const messageSchema = new Schema<IMessage>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: false,
      trim: true,
    },
    type: {
      type: String,
      enum: ["TEXT", "IMAGE", "AUDIO", "LOCATION", "DOCUMENT"],
      default: "TEXT",
    },
    attachmentUrl: {
      type: String,
      default: "",
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
messageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, read: 1 });

export const Message = mongoose.model<IMessage>("Message", messageSchema);
