import { Document, Types } from "mongoose";

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IConversation {
  user: {
    _id: string;
    name: string;
    profileImage?: string;
    isOnline: boolean;
  };
  lastMessage: {
    message: string;
    createdAt: Date;
    senderId: string;
  };
  unreadCount: number;
}
