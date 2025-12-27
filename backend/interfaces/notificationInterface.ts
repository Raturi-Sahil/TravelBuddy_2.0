import { Document, Types } from "mongoose";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: string;
  message: string;
  isRead: boolean;
  link?: string;
  relatedId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
