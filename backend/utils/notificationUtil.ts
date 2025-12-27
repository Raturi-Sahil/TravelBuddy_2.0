import { Types } from "mongoose";
import { Notification } from "../models/notificationModel";
import { getIO, getReceiverSocketId } from "../socket";
import { User } from "../models/userModel";

interface NotificationData {
  recipient: Types.ObjectId | string;
  sender?: Types.ObjectId | string;
  type: string;
  message: string;
  link?: string;
  relatedId?: Types.ObjectId | string;
}

/**
 * Creates a notification in the database and emits it via Socket.IO
 */
export const sendNotification = async (data: NotificationData) => {
  try {
    // 1. Save to Database
    const notification = await Notification.create({
      recipient: data.recipient,
      sender: data.sender,
      type: data.type,
      message: data.message,
      link: data.link,
      relatedId: data.relatedId,
      isRead: false,
    });

    // 2. Emit via Socket.IO
    // We need the recipient's Clerk ID to find their socket connection
    // (assuming socket is keyed by Clerk ID based on socket.ts)
    const recipientUser = await User.findById(data.recipient).select("clerk_id");

    if (recipientUser && recipientUser.clerk_id) {
      const socketId = getReceiverSocketId(recipientUser.clerk_id);

      if (socketId) {
        const io = getIO();

        // Populate sender info for the toast notification
        const populatedNotification = await notification.populate("sender", "name profileImage");

        io.to(socketId).emit("newNotification", populatedNotification);
      }
    }

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    // Silent fail so main flow doesn't break
  }
};
