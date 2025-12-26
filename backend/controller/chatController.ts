import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import { Message } from "../models/messageModel";
import { User } from "../models/userModel";
import { getIO, getReceiverSocketId } from "../socket";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

// Get all conversations for the current user
export const getConversations = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const userId = req.user._id;

    // Find all unique users the current user has chatted with
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: new mongoose.Types.ObjectId(userId) },
            { receiverId: new mongoose.Types.ObjectId(userId) },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", new mongoose.Types.ObjectId(userId)] },
              "$receiverId",
              "$senderId",
            ],
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiverId", new mongoose.Types.ObjectId(userId)] },
                    { $eq: ["$read", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $project: {
          _id: 0,
          user: {
            _id: "$user._id",
            name: "$user.name",
            profileImage: "$user.profileImage",
            isOnline: "$user.isOnline",
          },
          lastMessage: {
            message: "$lastMessage.message",
            createdAt: "$lastMessage.createdAt",
            senderId: "$lastMessage.senderId",
          },
          unreadCount: 1,
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    return res
      .status(200)
      .json(new ApiResponse(200, conversations, "Conversations fetched successfully"));
  }
);

// Get messages between current user and another user
export const getMessages = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const { otherUserId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // Verify the other user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      throw new ApiError(404, "User not found");
    }

    // Check if they are friends
    const currentUser = await User.findById(userId);
    if (!currentUser?.friends.includes(otherUserId)) {
      throw new ApiError(403, "You can only message friends");
    }

    // Get messages
    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      { senderId: otherUserId, receiverId: userId, read: false },
      { read: true }
    );

    // Notify sender that messages were read (via socket)
    const receiverSocketId = getReceiverSocketId(otherUser.clerk_id);
    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("messagesRead", { by: userId });
    }

    // Get total count for pagination
    const total = await Message.countDocuments({
      $or: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          messages: messages.reverse(), // Chronological order
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
        "Messages fetched successfully"
      )
    );
  }
);

// Send a message
export const sendMessage = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const { receiverId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      throw new ApiError(400, "Message cannot be empty");
    }

    // Verify receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      throw new ApiError(404, "User not found");
    }

    // Check if they are friends
    const sender = await User.findById(userId);
    if (!sender?.friends.includes(receiverId)) {
      throw new ApiError(403, "You can only message friends");
    }

    // Create message
    const newMessage = await Message.create({
      senderId: userId,
      receiverId,
      message: message.trim(),
    });

    // Send real-time notification
    const receiverSocketId = getReceiverSocketId(receiver.clerk_id);
    if (receiverSocketId) {
      getIO().to(receiverSocketId).emit("newMessage", {
        _id: newMessage._id,
        senderId: userId,
        receiverId,
        message: newMessage.message,
        read: false,
        createdAt: newMessage.createdAt,
        sender: {
          _id: sender._id,
          name: sender.name,
          profileImage: sender.profileImage,
        },
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, newMessage, "Message sent successfully"));
  }
);

// Mark messages as read
export const markAsRead = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const { senderId } = req.params;

    await Message.updateMany(
      { senderId, receiverId: userId, read: false },
      { read: true }
    );

    // Notify sender
    const sender = await User.findById(senderId);
    if (sender) {
      const senderSocketId = getReceiverSocketId(sender.clerk_id);
      if (senderSocketId) {
        getIO().to(senderSocketId).emit("messagesRead", { by: userId });
      }
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Messages marked as read"));
  }
);
