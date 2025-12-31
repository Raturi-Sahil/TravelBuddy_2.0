import { Request, Response } from "express";
import mongoose from "mongoose";

import { Activity } from "../models/activityModel";
import { ChatGroup } from "../models/chatGroupModel";
import { GroupMessage } from "../models/groupMessageModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";


export const getGroupChatByActivity = asyncHandler(
    async (req: Request & { user: any }, res: Response) => {

        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized"
            );
        }

        const userId = req.user._id;
        const { activityId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(activityId)) {
            throw new ApiError(
                400,
                "Invalid activity id"
            );
        }

        const activity = await Activity.findById(activityId);

        //check if the activity exists
        if (!activity) {
            throw new ApiError(
                404,
                "Activity does not exist"
            );
        }

        //Check if the user has joined the activity.
        if (!activity.participants.some(
            (participantId) => participantId.toString() === userId.toString())) {
            throw new ApiError(403, "You are not a participant of this activity");

        }

        let groupChat = await ChatGroup.findOne({ activityId })
            .populate("participants", "name profileImage")
            .populate("createdBy", "name profileImage");

        if (!groupChat) {
            // Self-healing: Create the group chat if it doesn't exist
            groupChat = await ChatGroup.create({
                activityId: activity._id,
                name: activity.title,
                createdBy: activity.createdBy,
                participants: activity.participants as any,
            });

            // Update activity to reflect group existence
            await Activity.findByIdAndUpdate(activityId, { groupExists: true });

            // Re-fetch to Populate fields for consistent response
            groupChat = await ChatGroup.findById(groupChat._id)
                .populate("participants", "name profileImage")
                .populate("createdBy", "name profileImage");
        } else {
            // SYNC FIX: Ensure ChatGroup participants match Activity participants
            // The Activity is the source of truth. If a user is in Activity but not Chat, fix it.
            const activityParticipantIds = activity.participants.map(p => p.toString());
            const chatParticipantIds = groupChat.participants.map((p: any) => p._id.toString());

            const isSynced = activityParticipantIds.length === chatParticipantIds.length &&
                activityParticipantIds.every(id => chatParticipantIds.includes(id));

            if (!isSynced) {
                console.log(`Syncing participants for chat ${groupChat._id}`);
                groupChat.participants = activity.participants as any;
                await groupChat.save();
            }
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

import uploadOnCloudinary from "../middlewares/cloudinary";

export const sendGroupChatMessage = asyncHandler(
    async (req: Request & { user: any; file?: any }, res: Response) => {

        console.log("---- SEND GROUP CHAT MESSAGE ----");
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        if (!req.user) {
            throw new ApiError(
                401,
                "Unauthorized"
            );
        }

        const userId = req.user._id;

        const { chatId } = req.params;

        const { message, type } = req.body;

        // If no file and no attachmentUrl, message is required. If file or attachmentUrl, message is optional (caption).
        if (!req.file && !req.body.attachmentUrl && (!message || typeof message !== "string" || !message.trim())) {
            throw new ApiError(400, "Message content or attachment is required");
        }

        if (!mongoose.Types.ObjectId.isValid(chatId)) {
            throw new ApiError(
                400,
                "Invalid group id"
            );
        }

        const chatGroup = await ChatGroup.findById(chatId);

        //check if the activity exists
        if (!chatGroup) {
            throw new ApiError(
                404,
                "chat group does not exist"
            );
        }

        //Check if the user has joined the activity.
        if (!chatGroup.participants.some(
            (participantId) => participantId.toString() === userId.toString())) {
            throw new ApiError(403, "You are not a participant of this chat group");
        }

        let attachmentUrl = req.body.attachmentUrl || "";
        let messageType = type || "TEXT";

        if (req.file) {
            const uploadedFile = await uploadOnCloudinary(req.file.path);
            if (uploadedFile) {
                attachmentUrl = uploadedFile.secure_url;
                // Determine type based on file if not provided
                if (!type) {
                    if (req.file.mimetype.startsWith("image/")) {
                        messageType = "IMAGE";
                    } else if (req.file.mimetype.startsWith("audio/")) {
                        messageType = "AUDIO";
                    } else {
                        messageType = "DOCUMENT";
                    }
                }
            } else {
                throw new ApiError(500, "Failed to upload attachment");
            }
        }

        const cleanMessage = message ? message.trim() : "";

        const groupMessage = await GroupMessage.create({
            chatGroupId: chatId,
            senderId: userId,
            message: cleanMessage,
            type: messageType,
            attachmentUrl: attachmentUrl
        });

        const lastMsgPreview = attachmentUrl
            ? (messageType === "IMAGE" ? "📷 Image" : "📎 Attachment")
            : cleanMessage;

        await ChatGroup.findByIdAndUpdate(chatId, {
            lastMessage: lastMsgPreview,
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

export const updateGroupChatMessage = asyncHandler(
    async (req: Request & { user: any }, res: Response) => {
        const { messageId } = req.params;
        const { message } = req.body;

        if (!req.user) {
            throw new ApiError(401, "Unauthorized");
        }

        if (!mongoose.Types.ObjectId.isValid(messageId)) {
            throw new ApiError(400, "Invalid message id");
        }

        const groupMessage = await GroupMessage.findById(messageId);

        if (!groupMessage) {
            throw new ApiError(404, "Message not found");
        }

        // Only the sender can update the message
        if (groupMessage.senderId.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You can only update your own messages");
        }

        groupMessage.message = message || groupMessage.message;
        await groupMessage.save();

        return res.status(200).json(
            new ApiResponse(
                200,
                groupMessage,
                "Message updated successfully"
            )
        );
    }
);
