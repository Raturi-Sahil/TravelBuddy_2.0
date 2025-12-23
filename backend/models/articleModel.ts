import mongoose, { Schema } from "mongoose";

import { IComment, IArticle } from "../interfaces/articleInterface";

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

const articleSchema = new Schema<IArticle>(
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

    // Article content
    title: {
      type: String,
      required: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      maxlength: 300,
    },
    coverImage: {
      type: String,
      default: "",
    },
    images: [{ type: String }],

    // Category and tags
    category: {
      type: String,
      required: true,
      enum: [
        "Destination Guide",
        "Travel Tips",
        "Budget Travel",
        "Digital Nomad",
        "Sustainable Travel",
        "Food & Culture",
        "Photography",
        "Adventure",
      ],
      default: "Travel Tips",
    },
    tags: [{ type: String }],

    // Status and visibility
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    visibility: {
      type: String,
      enum: ["Public", "Friends", "Private"],
      default: "Public",
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

    views: {
      type: Number,
      default: 0,
    },

    // Read time (in minutes)
    readTime: {
      type: String,
      default: "5 min read",
    },

    // Publishing dates
    publishedAt: {
      type: Date,
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
articleSchema.index({ userId: 1, createdAt: -1 });
articleSchema.index({ category: 1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ visibility: 1 });
articleSchema.index({ status: 1 });

// Virtual for dynamic like count
articleSchema.virtual("actualLikesCount").get(function () {
  return this.likes.length;
});

// Pre-save middleware to update counts and calculate read time
articleSchema.pre("save", function () {
  this.likesCount = this.likes.length;
  this.commentsCount = this.comments.length;

  // Calculate read time based on content length (average 200 words per minute)
  if (this.content) {
    const wordCount = this.content.split(/\s+/).length;
    const minutes = Math.ceil(wordCount / 200);
    this.readTime = `${minutes} min read`;
  }

  // Auto-generate excerpt if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content.substring(0, 250) + "...";
  }

  // Set publishedAt on first publish
  if (this.status === "Published" && !this.publishedAt) {
    this.publishedAt = new Date();
  }
});

export const Article = mongoose.model<IArticle>("Article", articleSchema);
