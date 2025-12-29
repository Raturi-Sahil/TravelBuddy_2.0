import { Document, Types } from "mongoose";

// Notification types for the application
export type NotificationType =
  // Friend-related
  | "friend_request"
  | "friend_accepted"
  | "friend_rejected"
  // Activity-related
  | "activity_invite"
  | "activity_join"
  | "activity_leave"
  | "activity_update"
  | "activity_cancelled"
  // Expense-related
  | "expense_group_created"
  | "expense_group_deleted"
  | "expense_member_added"
  | "expense_member_removed"
  | "expense_member_left"
  | "expense_added"
  | "expense_deleted"
  | "expense_updated"
  | "payment_reminder"
  | "settlement_request"
  | "settlement_completed"
  // General
  | "profile_update"
  | "system"
  | "other";

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType | string;
  message: string;
  isRead: boolean;
  link?: string;
  relatedId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
