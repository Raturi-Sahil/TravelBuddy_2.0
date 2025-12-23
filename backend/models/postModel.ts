import mongoose, { Schema } from "mongoose";

import { IComment, IPost } from "../interfaces/postInterface";

const commentSchema = new Schema<IComment>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: true,
      maxlength: 500,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const postSchema = new Schema<IPost>(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    userLocation: {
      type: String,
      default: "",
    },

    // Media content
    image: {
      type: String,
      default: "",
    },
    images: [{ type: String }],
    videos: [{ type: String }],

    caption: {
      type: String,
      required: true,
      maxlength: 2000,
    },

    location: {
      name: { type: String },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    // Engagement metrics
    likes: [
      {
        type: String,
        ref: "User",
      },
    ],
    likesCount: {
      type: Number,
      default: 0,
    },

    comments: [commentSchema],
    commentsCount: {
      type: Number,
      default: 0,
    },

    shares: {
      type: Number,
      default: 0,
    },

    tags: [{ type: String }],

    visibility: {
      type: String,
      enum: ["Public", "Friends", "Private"],
      default: "Public",
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
postSchema.index({ userId: 1, createdAt: -1 });
postSchema.index({ "location.coordinates": "2dsphere" });
postSchema.index({ tags: 1 });
postSchema.index({ visibility: 1 });

// Virtual for dynamic like count (if needed for real-time accuracy)
postSchema.virtual("actualLikesCount").get(function () {
  return this.likes.length;
});

// Pre-save middleware to update counts
postSchema.pre("save", function (next) {
  this.likesCount = this.likes.length;
  this.commentsCount = this.comments.length;
  next();
});

export const Post = mongoose.model<IPost>("Post", postSchema);
