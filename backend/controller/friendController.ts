import { NextFunction, Request, Response } from "express";

import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

// Helper to format users - uses stored data, no Clerk API calls needed!
function formatUserData(users: any[]) {
  return users.map((user: any) => ({
    _id: user._id,
    name: user.name || 'Anonymous',
    profileImage: user.profileImage || '',
    nationality: user.nationality,
    travelStyle: user.travelStyle,
    gender: user.gender,
  }));
}

// Send Friend Request
export const sendFriendRequest = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const senderId = req.user._id;

    if (id === senderId.toString()) {
      throw new ApiError(400, "You cannot send a friend request to yourself");
    }

    const receiver = await User.findById(id);
    const sender = await User.findById(senderId);

    if (!receiver || !sender) {
      throw new ApiError(404, "User not found");
    }

    if (receiver.friends.includes(senderId)) {
      throw new ApiError(400, "You are already friends");
    }

    if (receiver.friendRequests.includes(senderId)) {
      throw new ApiError(400, "Friend request already sent");
    }

    if (receiver.sentFriendRequests.includes(senderId)) {
      throw new ApiError(400, "User has already sent you a friend request. Please accept it.");
    }

    receiver.friendRequests.push(senderId);
    sender.sentFriendRequests.push(receiver._id.toString());

    await receiver.save();
    await sender.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Friend request sent successfully"));
  }
);

// Accept Friend Request
export const acceptFriendRequest = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    const sender = await User.findById(id);

    if (!user || !sender) {
      throw new ApiError(404, "User not found");
    }

    if (!user.friendRequests.includes(id)) {
      throw new ApiError(400, "No friend request found from this user");
    }

    // Add to friends list
    user.friends.push(id);
    sender.friends.push(userId);

    // Remove from requests
    user.friendRequests = user.friendRequests.filter(
      (requestId: any) => requestId.toString() !== id
    );
    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (requestId: any) => requestId.toString() !== userId.toString()
    );

    await user.save();
    await sender.save();

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Friend request accepted"));
  }
);

// Reject Friend Request
export const rejectFriendRequest = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user._id;
  
      const user = await User.findById(userId);
      const sender = await User.findById(id);
  
      if (!user || !sender) {
        throw new ApiError(404, "User not found");
      }
  
      if (!user.friendRequests.includes(id)) {
        throw new ApiError(400, "No friend request found from this user");
      }
  
      // Remove from requests
      user.friendRequests = user.friendRequests.filter(
        (requestId: any) => requestId.toString() !== id
      );
      sender.sentFriendRequests = sender.sentFriendRequests.filter(
        (requestId: any) => requestId.toString() !== userId.toString()
      );
  
      await user.save();
      await sender.save();
  
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Friend request rejected"));
    }
);

// Remove Friend
export const removeFriend = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
      const { id } = req.params;
      const userId = req.user._id;
  
      const user = await User.findById(userId);
      const friend = await User.findById(id);
  
      if (!user || !friend) {
        throw new ApiError(404, "User not found");
      }
  
      if (!user.friends.includes(id)) {
          throw new ApiError(400, "User is not in your friend list");
      }

      user.friends = user.friends.filter(
        (friendId: any) => friendId.toString() !== id
      );
      friend.friends = friend.friends.filter(
        (friendId: any) => friendId.toString() !== userId.toString()
      );
  
      await user.save();
      await friend.save();
  
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Friend removed successfully"));
    }
);

// Get All Friends
export const getFriends = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const user = await User.findById(userId).populate("friends", "name profileImage nationality travelStyle gender");

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Format user data - no Clerk API calls needed!
    const formattedFriends = formatUserData(user.friends as any[]);

    return res
      .status(200)
      .json(new ApiResponse(200, formattedFriends, "Friends fetched successfully"));
  }
);

// Get Friend Requests
export const getFriendRequests = asyncHandler(
    async (req: Request | any, res: Response, next: NextFunction) => {
      const userId = req.user._id;
      const user = await User.findById(userId)
        .populate("friendRequests", "name profileImage nationality travelStyle gender")
        .populate("sentFriendRequests", "name profileImage nationality travelStyle gender");
  
      if (!user) {
        throw new ApiError(404, "User not found");
      }

      // Format both lists - no Clerk API calls needed!
      const formattedReceived = formatUserData(user.friendRequests as any[]);
      const formattedSent = formatUserData(user.sentFriendRequests as any[]);
  
      return res
        .status(200)
        .json(new ApiResponse(200, {
            received: formattedReceived,
            sent: formattedSent
        }, "Friend requests fetched successfully"));
    }
);

