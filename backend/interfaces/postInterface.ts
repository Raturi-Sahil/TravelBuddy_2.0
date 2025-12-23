import { Document } from "mongoose";

export interface IComment {
  userId: string;
  userName: string;
  userAvatar?: string;
  text: string;
  createdAt: Date;
}

export interface IPost extends Document {
  userId: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;

  image?: string;
  images?: string[];
  videos?: string[];

  caption: string;

  location?: {
    name: string;
    coordinates: [number, number];
  };

  likes: string[];
  likesCount: number;

  comments: IComment[];
  commentsCount: number;

  shares: number;

  tags?: string[];

  visibility: "Public" | "Friends" | "Private";

  createdAt: Date;
  updatedAt?: Date;
}
