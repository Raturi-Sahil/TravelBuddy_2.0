import { Document } from "mongoose";

export interface IComment {
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: Date;
}

export interface IArticle extends Document {
  userId: string;
  userName: string;
  userAvatar?: string;

  // Article content
  title: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  images?: string[];

  // Category and tags
  category: string;
  tags?: string[];

  // Status and visibility
  status: "Draft" | "Published";
  visibility: "Public" | "Friends" | "Private";

  // Engagement metrics
  likes: string[];
  likesCount: number;
  comments: IComment[];
  commentsCount: number;
  shares: number;
  views: number;

  // Read time
  readTime: string;

  // Dates
  publishedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
