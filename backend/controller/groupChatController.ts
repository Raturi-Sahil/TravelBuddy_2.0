import {Request, Response } from "express";
import mongoose from "mongoose";

import { Activity } from "../models/activityModel";
import { ChatGroup } from "../models/chatGroupModel";
import { GroupMessage } from "../models/groupMessageModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";


export const getGroupChatByActivity = asyncHandler(
    async(req: Request & { user: any }, res: Response) => {
        
        if(!req.user) {
            throw new ApiError(
                401,
                "Unauthorized"
            );
        }

        const userId = req.user._id;
        const {id} = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError (
                400,
                "Invalid activity id"
            );
        }

        const activity = await Activity.findById(id);

        //check if the activity exists
        if(!activity) {
            throw new ApiError (
                404,
                "Activity does not exist"
            );  
        }

        //Check if the user has joined the activity.
        if(!activity.participants.some(
        (participantId) => participantId.toString() === userId.toString())) {
            throw new ApiError(403, "You are not a participant of this activity");

        }

        const groupChat = await ChatGroup.findOne({ activityId: id })
        .populate("participants", "name profileImage")
        .populate("createdBy", "name profileImage");

        if(!groupChat) {
            throw new ApiError (
                404, 
                "Not found"
            );
        }

        return res.status(200).json(
            new ApiResponse(
                200, 
                groupChat,
                "groupChat fetched successfully"
            )
        );
    }
);

export const sendGroupChatMessage = asyncHandler(
    async(req: Request & { user: any }, res: Response) => {
        
        if(!req.user) {
            throw new ApiError(
                401,
                "Unauthorized"
            );
        }

        const userId = req.user._id;

        const {chatId} = req.params;

        const { message } = req.body;

        if (!message || typeof message !== "string" || !message.trim()) {
           throw new ApiError(400, "Message content is required");
        }

        if(!mongoose.Types.ObjectId.isValid(chatId)) {
            throw new ApiError (
                400,
                "Invalid group id"
            );
        }

        const chatGroup = await ChatGroup.findById(chatId);

        //check if the activity exists
        if(!chatGroup) {
            throw new ApiError (
                404,
                "chat group does not exist"
            );  
        }

        //Check if the user has joined the activity.
        if(!chatGroup.participants.some(
        (participantId) => participantId.toString() === userId.toString())) {
            throw new ApiError(403, "You are not a participant of this chat group");

        }

        const cleanMessage = message.trim();

        const groupMessage = await GroupMessage.create({
            chatGroupId: chatId,
            senderId: userId,
            message: cleanMessage,
        });

        await ChatGroup.findByIdAndUpdate(chatId, {
            lastMessage: cleanMessage,
        });

        return res.status(201).json(
            new ApiResponse(
                201, 
                groupMessage,
                "Group message created successfully"
            )
        );
    }
);

export const getGroupChatMessages = asyncHandler(
  async (req: Request & { user: any }, res: Response) => {

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      throw new ApiError(400, "Invalid group id");
    }

    const chatGroup = await ChatGroup.findById(chatId);

    if (!chatGroup) {
      throw new ApiError(404, "Chat group does not exist");
    }

    // Authorization: user must be a participant
    if (
      !chatGroup.participants.some(
        (participantId) => participantId.toString() === userId.toString()
      )
    ) {
      throw new ApiError(403, "You are not a participant of this chat group");
    }

    const messages = await GroupMessage.find({
      chatGroupId: chatId,
    }).sort({ createdAt: 1 }); // oldest → newest

    return res.status(200).json(
      new ApiResponse(
        200,
        messages,
        "Group chat messages fetched successfully"
      )
    );
  }
);
