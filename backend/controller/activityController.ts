
import axios from "axios";
import { Request, Response } from "express";
import mongoose from "mongoose";

import uploadOnCloudinary from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";
import { Activity } from "../models/activityModel";
import { ActivityPayment } from "../models/activityPaymentModel";
import { ChatGroup } from "../models/chatGroupModel";
import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { sendNotification } from "../utils/notificationUtil";
import { activityZodSchema } from "../validation/activityValidation";

export const createActivity = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    console.log("createActivity: Request received");

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = req.user;
    const userId = user._id;
    const now = new Date();

    console.log("createActivity: Validating body", req.body);
    const validatedData = activityZodSchema.parse(req.body);

    let entitlement: "PREMIUM" | "SINGLE" | "FREE";

    const isPremiumActive =
      (user.planType === "Monthly" || user.planType === "Yearly") &&
      user.planEndDate &&
      now < new Date(user.planEndDate);

    if (isPremiumActive) {
      entitlement = "PREMIUM";
    } else if (
      user.planType === "Single" &&
      user.remainingActivityCount > 0
    ) {
      entitlement = "SINGLE";
    } else if (!user.hasUsedFreeTrial) {
      entitlement = "FREE";
    } else {
      throw new ApiError(
        403,
        "Please purchase a plan to create an activity"
      );
    }

    let files: Express.Multer.File[] = [];

    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === "object") {
      files = (req.files as any).photos || [];
    }

    console.log(`createActivity: Processing ${files.length} files`);

    const uploadedImageUrls: string[] = [];

    try {
      for (const file of files) {
        console.log(`createActivity: Uploading file ${file.originalname}`);
        const result = await uploadOnCloudinary(file.path);
        if (!result) {
          throw new ApiError(500, "Image upload failed");
        }
        uploadedImageUrls.push(result.secure_url);
      }
    } catch (err) {
      console.error("createActivity: Upload error", err);
      for (const url of uploadedImageUrls) {
        await deleteFromCloudinaryByUrl(url);
      }
      throw err;
    }

    let location;
    if (req.body.lat !== undefined && req.body.lng !== undefined) {
      location = {
        type: "Point",
        coordinates: [
          Number(req.body.lng),
          Number(req.body.lat),
        ],
      };
    }
    console.log("createActivity: Location prepared", location);

    try {
      // CREATE ACTIVITY
      console.log("createActivity: Creating DB entry");
      const activity = await Activity.create({
        ...validatedData,
        location,
        photos: uploadedImageUrls,
        createdBy: userId,
        participants: [userId],
      });

      if (!activity) {
        throw new ApiError(500, "Failed to create activity");
      }

      console.log("createActivity: Created activity", activity._id);

      // CONSUME ENTITLEMENT
      const userUpdate: any = {
        $push: { JoinActivity: activity._id },
      };

      if (entitlement === "FREE") {
        userUpdate.hasUsedFreeTrial = true;
      }

      if (entitlement === "SINGLE") {
        const remaining = user.remainingActivityCount - 1;
        userUpdate.remainingActivityCount = remaining;
        if (remaining === 0) {
          userUpdate.planType = "None";
        }
      }

      await User.findByIdAndUpdate(userId, userUpdate);
      console.log("createActivity: User updated");

      // create activty chat group
      await ChatGroup.findOneAndUpdate(
        { activityId: activity._id },
        {
          activityId: activity._id,
          name: activity.title,
          createdBy: userId,
          participants: [userId],
        },
        { upsert: true, new: true },
      );

      // Ensure activity knows group exists
      await Activity.findByIdAndUpdate(activity._id, { groupExists: true });
      // 1. Notify Creator (Self-Confirmation)
      await sendNotification({
        recipient: userId,
        sender: userId,
        type: "ACTIVITY_CREATED_SELF",
        message: `You successfully created a new activity: ${activity.title}`,
        link: `/activity/${activity._id}`,
        relatedId: activity._id,
      });

      // 2. Notify Friends
      if (user.friends && user.friends.length > 0) {
        for (const friendId of user.friends) {
          await sendNotification({
            recipient: friendId,
            sender: userId,
            type: "ACTIVITY_CREATED",
            message: `${user.name} created a new activity: ${activity.title}`,
            link: `/activity/${activity._id}`,
            relatedId: activity._id,
          });
        }
      }

      return res
        .status(201)
        .json(
          new ApiResponse(
            201,
            activity,
            "Activity created successfully"
          )
        );
    } catch (err) {
      console.error("createActivity: DB Error", err);
      // cleanup uploaded images if DB fails
      for (const url of uploadedImageUrls) {
        await deleteFromCloudinaryByUrl(url);
      }

      throw err;
    }
  }
);


export const getActivities = asyncHandler(
  async (req: Request, res: Response) => {

    const now = new Date();

    const activities = await Activity.find(
      {
        date: { $gte: now },
        isCancelled: { $ne: true }  // Exclude cancelled activities
      })
      .sort({ date: 1, startTime: 1 })
      .populate(
        "createdBy", "name email mobile profileImage"
      ).lean();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activities,
          "Activities fetched successfully"
        )
      );
  }
);

// Get activities where the authenticated user is a participant
export const getJoinedActivities = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;

    const activities = await Activity.find({
      participants: userId
      // Don't filter cancelled - show all activities to participants
    })
      .sort({ date: 1, startTime: 1 })
      .populate("createdBy", "name email mobile profileImage")
      .lean();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activities,
          "Joined activities fetched successfully"
        )
      );
  }
);

// Get activities created by the authenticated user
export const getMyCreatedActivities = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;

    const activities = await Activity.find({
      createdBy: userId

    })
      .sort({ date: -1 })
      .populate("createdBy", "name email mobile profileImage")
      .lean();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activities,
          "Created activities fetched successfully"
        )
      );
  }
);


export const getNearbyActivities = asyncHandler(
  async (req: Request, res: Response) => {
    const { lat, lng, radius = 50000, search = '', page = 1, limit = 50 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));
    const skip = (pageNum - 1) * limitNum;
    const now = new Date();

    // Build the query
    const query: any = {
      date: { $gte: now },
      isCancelled: { $ne: true }  // Exclude cancelled activities
    };

    // Geospatial filter if lat/lng provided
    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusMeters = parseFloat(radius as string) || 50000;

      // Convert radius from meters to radians for $centerSphere
      // Earth's radius is approximately 6378100 meters
      const radiusInRadians = radiusMeters / 6378100;

      // Use $geoWithin with $centerSphere instead of $nearSphere to allow custom sorting
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [longitude, latitude],
            radiusInRadians
          ]
        }
      };
    }

    // Text search filter
    if (search) {
      const searchRegex = { $regex: search as string, $options: 'i' };
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
    }

    // Get total count for pagination
    const totalCount = await Activity.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    // Fetch activities with pagination
    const activities = await Activity.find(query)
      .sort({ date: 1, startTime: 1 }) // Now we can sort since using $geoWithin instead of $nearSphere
      .skip(skip)
      .limit(limitNum)
      .populate("createdBy", "name email mobile profileImage")
      .lean();

    // Calculate distance for each activity if user location provided
    const activitiesWithDistance = activities.map((activity: any) => {
      if (lat && lng && activity.location?.coordinates) {
        const [actLng, actLat] = activity.location.coordinates;
        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);

        // Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (actLat - userLat) * Math.PI / 180;
        const dLng = (actLng - userLng) * Math.PI / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLat * Math.PI / 180) * Math.cos(actLat * Math.PI / 180) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = (R * c).toFixed(1);

        return { ...activity, distanceKm };
      }
      return { ...activity, distanceKm: null };
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          activities: activitiesWithDistance,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
            hasMore: pageNum < totalPages
          }
        },
        "Nearby activities fetched successfully"
      )
    );
  }
);

export const getActivityById = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    //Validate the objectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(
        400,
        "Invalid activity id"
      );
    }

    //Fetch activity
    const activity = await Activity.findById(id)
      .populate("createdBy", "name email mobile profileImage")
      .populate("participants", "name email mobile profileImage")
      .lean();

    //Handle, if the activity not found.
    if (!activity) {
      throw new ApiError(
        404,
        "Requested Activity doesn't exist"
      );
    }

    //Response
    return res.status(200).json(
      new ApiResponse(
        200,
        activity,
        "Activity fetched successfully"
      )
    );
  }
);

export const getParticipants = asyncHandler(
  async (req: Request, res: Response) => {

    const { id } = req.params;

    //Validate the objectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(
        400,
        "Invalid activity id"
      );
    }

    //Fetch activity
    const activity = await Activity.findById(id)
      .select("participants")
      .populate("participants", "name profileImage")
      .lean();

    //Handle, if the activity not found.
    if (!activity) {
      throw new ApiError(
        404,
        "Requested Activity doesn't exist"
      );
    }

    //Response
    return res.status(200).json(
      new ApiResponse(
        200,
        activity.participants,
        "participants fetched successfully"
      )
    );
  }
);

export const updateActivity = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized"
      );
    }

    const updateActivityZodSchema = activityZodSchema.partial();
    const validatedData = updateActivityZodSchema.parse(req.body);

    const userId = req.user._id;

    const { id } = req.params;

    //Validate the objectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(
        400,
        "Invalid activity id"
      );
    }

    //Fetch activity
    const activity = await Activity.findById(id);

    //Handle, if the activity not found.
    if (!activity) {
      throw new ApiError(
        404,
        "Requested Activity doesn't exist"
      );
    }

    if (activity.createdBy.toString() !== userId.toString()) {
      throw new ApiError(
        403,
        "You are not allowed to update this activity"
      );
    }

    // Get participants for notification
    const participantsToNotify = activity.participants || [];

    //update the activity
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      validatedData,
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email mobile profileImage")
      .lean();

    // Notify Creator (Self-Confirmation)
    await sendNotification({
      recipient: userId,
      sender: userId,
      type: "ACTIVITY_UPDATED_SELF",
      message: `You updated the activity: ${activity.title}`,
      link: `/activity/${id}`,
      relatedId: id,
    });

    // Notify Participants about the update
    for (const participantId of participantsToNotify) {
      if (participantId.toString() !== userId.toString()) {
        await sendNotification({
          recipient: participantId,
          sender: userId,
          type: "ACTIVITY_UPDATED",
          message: `${req.user.name} updated the activity: ${activity.title}`,
          link: `/activity/${id}`,
          relatedId: id,
        });
      }
    }

    //Response
    return res.status(200).json(
      new ApiResponse(
        200,
        updatedActivity,
        "Activity updated successfully"
      )
    );
  }
);

export const joinActivity = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized"
      );
    }

    const userId = req.user._id;

    const { id } = req.params;

    //Validate the objectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(
        400,
        "Invalid activity id"
      );
    }

    //Fetch activity
    const activity = await Activity.findById(id);

    //Handle, if the activity not found.
    if (!activity) {
      throw new ApiError(
        404,
        "Requested Activity doesn't exist"
      );
    }

    if (activity.price > 0) {
      const payment = await ActivityPayment.findOne({ userId, activityId: id, status: "SUCCESS" });

      if (!payment) {
        throw new ApiError(
          402,
          "Payment required to join this activity"
        )
      }
    }

    if (activity.participants.some(
      (participantId) => participantId.toString() === userId.toString()
    )) {
      throw new ApiError(
        409,
        "conflict"
      );
    }

    //check if space is available, and refund the money if user has paid but space is not available.
    if (activity.participants.length >= activity.maxCapacity) {
      throw new ApiError(409, "Activity is already full");
    }

    //update the activity
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { $addToSet: { participants: userId } },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email mobile profileImage")
      .lean();

    // Also update the user's JoinActivity array
    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { JoinActivity: id } }
    );

    //Add user to the chat group
    await ChatGroup.findOneAndUpdate(
      { activityId: id },
      { $addToSet: { participants: userId } }
    );

    // Notify the user who joined
    await sendNotification({
      recipient: userId,
      sender: userId,
      type: "ACTIVITY_JOIN",
      message: `You successfully joined "${activity.title}"`,
      link: `/activity/${id}`,
      relatedId: id,
    });

    // Notify the activity creator
    if (activity.createdBy.toString() !== userId.toString()) {
      const userName = req.user?.name || "A traveler";
      await sendNotification({
        recipient: activity.createdBy,
        sender: userId,
        type: "ACTIVITY_HOST_JOIN",
        message: `${userName} has joined your activity "${activity.title}"`,
        link: `/activity/${id}`,
        relatedId: id,
      });
    }

    //Response
    return res.status(200).json(
      new ApiResponse(
        200,
        updatedActivity,
        "Activity joined successfully"
      )
    );
  }
);

export const leaveActivity = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized"
      );
    }

    const userId = req.user._id;

    const { id } = req.params;

    //Validate the objectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(
        400,
        "Invalid activity id"
      );
    }

    //Fetch activity
    const activity = await Activity.findById(id);

    //Handle, if the activity not found.
    if (!activity) {
      throw new ApiError(
        404,
        "Requested Activity doesn't exist"
      );
    }

    if (!activity.participants.some(
      (participantId) => participantId.toString() === userId.toString()
    )) {
      throw new ApiError(
        409,
        "conflict"
      );
    }

    //update the activity
    const updatedActivity = await Activity.findByIdAndUpdate(
      id,
      { $pull: { participants: userId } },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email mobile profileImage")
      .lean();

    await ChatGroup.findOneAndUpdate(
      { activityId: id },
      {
        $pull: { participants: userId }
      }
    );

    // Notify the user who left
    await sendNotification({
      recipient: userId,
      sender: userId,
      type: "ACTIVITY_LEAVE",
      message: `You have left the activity "${activity.title}"`,
      link: `/activity/${id}`,
      relatedId: id,
    });

    // Notify the activity creator
    if (activity.createdBy.toString() !== userId.toString()) {
      const userName = req.user?.name || "A traveler";
      await sendNotification({
        recipient: activity.createdBy,
        sender: userId,
        type: "ACTIVITY_HOST_LEAVE",
        message: `${userName} has left your activity "${activity.title}"`,
        link: `/activity/${id}`,
        relatedId: id,
      });
    }

    //Response
    return res.status(200).json(
      new ApiResponse(
        200,
        updatedActivity,
        "Activity left successfully"
      )
    );
  }
);

export const deleteActivity = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized"
      );
    }

    const userId = req.user._id;

    const { id } = req.params;

    //Validate the objectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(
        400,
        "Invalid activity id"
      );
    }

    //Fetch activity
    const activity = await Activity.findById(id);

    //Handle, if the activity not found.
    if (!activity) {
      throw new ApiError(
        404,
        "Requested Activity doesn't exist"
      );
    }

    if (activity.createdBy.toString() !== userId.toString()) {
      throw new ApiError(
        403,
        "Not the creater"
      );
    }



    // Capture participants to notify
    const participantsToNotify = activity.participants || [];

    // Notify Creator (Self-Confirmation)
    await sendNotification({
      recipient: userId,
      sender: userId,
      type: "ACTIVITY_DELETED_SELF",
      message: `You successfully deleted the activity: ${activity.title}`,
      link: `/activities`, // Redirect to list as detail page is gone
      relatedId: null, // ID is gone
    });

    // Notify Participants
    for (const participantId of participantsToNotify) {
      if (participantId.toString() !== userId.toString()) {
        await sendNotification({
          recipient: participantId,
          sender: userId,
          type: "ACTIVITY_DELETED",
          message: `${req.user.name} deleted the activity: ${activity.title}`,
          link: `/activities`,
          relatedId: null,
        });
      }
    }

    //delete the activity
    await Activity.findByIdAndDelete(id);

    //Response
    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Activity deleted successfully"
      )
    );
  }
);

export const inviteUsers = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized"
      );
    }

    const creatorId = req.user._id;

    const { id } = req.params;

    //Validate the objectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(
        400,
        "Invalid activity id"
      );
    }

    //Fetch activity
    const activity = await Activity.findById(id);

    //Handle, if the activity not found.
    if (!activity) {
      throw new ApiError(
        404,
        "Requested Activity doesn't exist"
      );
    }

    // check if user is the creator of the activity.
    if (activity.createdBy.toString() !== creatorId.toString()) {
      throw new ApiError(
        403,
        "Not allowed to invite users"
      );
    }

    const userIds = req.body.userIds;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      throw new ApiError(400, "userIds must be a non-empty array");
    }

    for (const userId of userIds) {
      // if the user Id is invlid
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new ApiError(
          400,
          "Invalid user id"
        );
      }
      //Check if the user Exists or not
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        throw new ApiError(
          404,
          "user no found"
        );
      }

      // if the user is already a participant in the activity.
      if (activity.participants.some(
        (pid) => pid.toString() === userId.toString()
      )) {
        throw new ApiError(
          409,
          "user already a participant"
        );
      }
      //If user is already invited
      if (activity.invitedUsers.some(
        (invite) => invite.userId.toString() === userId.toString()
      )) {
        throw new ApiError(
          409,
          "User already invited"
        );
      }

    }

    await Activity.findByIdAndUpdate(
      id,
      {
        $addToSet: {
          invitedUsers: userIds.map((uid) => ({
            userId: uid,
            status: "Pending"
          }))
        }
      },
      { new: true }
    );

    // Notify each invited user
    for (const invitedUserId of userIds) {
      await sendNotification({
        recipient: invitedUserId,
        sender: creatorId,
        type: "ACTIVITY_INVITE",
        message: `${req.user.name} invited you to join: ${activity.title}`,
        link: `/activity/${id}`,
        relatedId: id,
      });
    }

    //Response
    return res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Invite sent successfully"
      )
    );
  }
);

export const respondToInvite = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(
        401,
        "Unauthorized"
      );
    }

    const userId = req.user._id;

    const { id } = req.params;

    //Validate the objectId.
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(
        400,
        "Invalid activity id"
      );
    }


    //Fetch activity
    const activity = await Activity.findById(id);

    //Handle, if the activity not found.
    if (!activity) {
      throw new ApiError(
        404,
        "Requested Activity doesn't exist"
      );
    }

    const invite = activity.invitedUsers.find(
      (invite) => invite.userId.toString() === userId.toString()
    );

    if (!invite) throw new ApiError(404, "Invite not found");

    if (invite.status !== "Pending") {
      throw new ApiError(409, "Invite already responded");
    }

    const { status } = req.body;

    if (status == "Accepted") {
      //Check if the activity is full
      if (activity.participants.length >= activity.maxCapacity) {
        throw new ApiError(409, "Activity is full");
      }

      await Activity.findByIdAndUpdate(
        { _id: id, "invitedUsers.userId": userId },
        { $set: { "invitedUsers.$.status": "Accepted" } }
      );
      await Activity.findByIdAndUpdate(
        id,
        {
          $addToSet: { participants: userId }
        }
      );

      // Notify the user who accepted
      await sendNotification({
        recipient: userId,
        sender: userId,
        type: "ACTIVITY_INVITE_ACCEPTED_SELF",
        message: `You accepted the invite to: ${activity.title}`,
        link: `/activity/${id}`,
        relatedId: id,
      });

      // Notify the activity creator
      await sendNotification({
        recipient: activity.createdBy,
        sender: userId,
        type: "ACTIVITY_INVITE_ACCEPTED",
        message: `${req.user.name} accepted your invite to: ${activity.title}`,
        link: `/activity/${id}`,
        relatedId: id,
      });
    } else {
      await Activity.findByIdAndUpdate(
        { _id: id, "invitedUsers.userId": userId },
        { $set: { "invitedUsers.$.status": "Rejected" } }
      );

      // Notify the activity creator about rejection
      await sendNotification({
        recipient: activity.createdBy,
        sender: userId,
        type: "ACTIVITY_INVITE_REJECTED",
        message: `${req.user.name} declined your invite to: ${activity.title}`,
        link: `/activity/${id}`,
        relatedId: id,
      });
    }

    //Response
    return res.status(200).json(
      new ApiResponse(
        200,
        status,
        "updated invite status"
      )
    );
  }
);

// Helper function for Cashfree config
const getCashfreeConfig = () => {
  const CF_APP_ID = process.env.CASHFREE_APP_ID;
  const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
  const CF_ENV = process.env.CASHFREE_ENV || "TEST";
  const BASE_URL = CF_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
  return { CF_APP_ID, CF_SECRET_KEY, BASE_URL };
};

// Create payment order for joining activity
export const createActivityPaymentOrder = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { CF_APP_ID, CF_SECRET_KEY, BASE_URL } = getCashfreeConfig();
    const userId = req.user._id;
    const { id } = req.params; // activity id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid activity id");
    }

    const activity = await Activity.findById(id);
    if (!activity) {
      throw new ApiError(404, "Activity not found");
    }

    // Check if already joined
    if (activity.participants.some(
      (participantId) => participantId.toString() === userId.toString()
    )) {
      throw new ApiError(409, "Already joined this activity");
    }

    // Check if activity is full
    if (activity.participants.length >= activity.maxCapacity) {
      throw new ApiError(409, "Activity is already full");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (!CF_APP_ID || !CF_SECRET_KEY) {
      console.error("Cashfree credentials missing");
      throw new ApiError(500, "Payment configuration missing");
    }

    const orderId = `ACTIVITY_${Date.now()}_${userId.toString().slice(-4)}`;
    const amount = activity.price;

    // If activity is free, directly join
    if (amount === 0) {
      const updatedActivity = await Activity.findByIdAndUpdate(
        id,
        { $addToSet: { participants: userId } },
        { new: true, runValidators: true }
      )
        .populate("createdBy", "name email mobile profileImage")
        .lean();

      // Also update the user's JoinActivity array
      await User.findByIdAndUpdate(
        userId,
        { $addToSet: { JoinActivity: id } }
      );

      return res.status(200).json(
        new ApiResponse(200, { activity: updatedActivity, isFree: true }, "Joined activity successfully")
      );
    }

    const payload = {
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_email: "user@example.com",
        customer_phone: user.mobile,
        customer_name: user.name || "TravelBuddy User"
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/activity-payment-status?order_id=${orderId}&activity_id=${id}`
      },
      order_tags: {
        activityId: id,
        activityTitle: activity.title
      }
    };

    const response = await axios.post(`${BASE_URL}/orders`, payload, {
      headers: {
        "x-client-id": CF_APP_ID,
        "x-client-secret": CF_SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json"
      }
    });

    // Save payment record
    await ActivityPayment.create({
      userId: userId,
      activityId: id,
      orderId: orderId,
      cfOrderId: response.data.cf_order_id,
      paymentSessionId: response.data.payment_session_id,
      amount: amount,
      currency: "INR",
      orderStatus: response.data.order_status || "ACTIVE",
      rawResponse: response.data,
    });

    return res.status(200).json(
      new ApiResponse(200, response.data, "Payment order created successfully")
    );
  }
);

// Verify payment and join activity
export const verifyActivityPayment = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { CF_APP_ID, CF_SECRET_KEY, BASE_URL } = getCashfreeConfig();
    const { orderId, activityId } = req.body;
    const userId = req.user._id;

    if (!orderId || !activityId) {
      throw new ApiError(400, "Order ID and Activity ID required");
    }

    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      throw new ApiError(400, "Invalid activity id");
    }

    const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-client-id": CF_APP_ID,
        "x-client-secret": CF_SECRET_KEY,
        "x-api-version": "2023-08-01"
      }
    });

    const orderData = response.data;
    const orderStatus = orderData.order_status;

    // Update payment record
    const paymentRecord = await ActivityPayment.findOne({ orderId: orderId });
    if (paymentRecord) {
      paymentRecord.orderStatus = orderStatus;
      paymentRecord.rawResponse = orderData;

      if (orderData.payments && orderData.payments.length > 0) {
        const paymentDetails = orderData.payments[0];
        paymentRecord.paymentStatus = paymentDetails.payment_status;
        paymentRecord.paymentMethod = paymentDetails.payment_method?.card?.channel ||
          paymentDetails.payment_method?.upi?.channel ||
          paymentDetails.payment_method?.netbanking?.channel ||
          "Unknown";
        paymentRecord.paymentTime = paymentDetails.payment_time
          ? new Date(paymentDetails.payment_time)
          : undefined;
        paymentRecord.cfPaymentId = paymentDetails.cf_payment_id;
        paymentRecord.bankReference = paymentDetails.bank_reference;
      }

      await paymentRecord.save();
    }

    if (orderStatus === "PAID") {
      // Join user to activity
      const activity = await Activity.findById(activityId);
      if (!activity) {
        throw new ApiError(404, "Activity not found");
      }

      // Check if already joined
      if (activity.participants.some(
        (participantId) => participantId.toString() === userId.toString()
      )) {
        return res.status(200).json(
          new ApiResponse(200, { status: "PAID", alreadyJoined: true }, "Already joined this activity")
        );
      }

      // Check if activity is full
      if (activity.participants.length >= activity.maxCapacity) {
        throw new ApiError(409, "Activity is full");
      }

      const updatedActivity = await Activity.findByIdAndUpdate(
        activityId,
        { $addToSet: { participants: userId } },
        { new: true, runValidators: true }
      )
        .populate("createdBy", "name email mobile profileImage")
        .lean();

      return res.status(200).json(
        new ApiResponse(
          200,
          { status: "PAID", activity: updatedActivity, payment: paymentRecord },
          "Payment verified and joined activity successfully"
        )
      );
    } else {
      throw new ApiError(400, `Payment not completed. Status: ${orderStatus}`);
    }
  }
);

// Cancel Activity
export const cancelActivity = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    // Validate the objectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid activity id");
    }

    // Validate reason
    if (!reason || reason.trim() === "") {
      throw new ApiError(400, "Cancellation reason is required");
    }

    // Fetch activity
    const activity = await Activity.findById(id);

    // Handle if activity not found
    if (!activity) {
      throw new ApiError(404, "Requested Activity doesn't exist");
    }

    // Check if user is the creator
    if (activity.createdBy.toString() !== userId.toString()) {
      throw new ApiError(403, "You are not allowed to cancel this activity");
    }

    // Check if activity is already cancelled
    if (activity.isCancelled) {
      throw new ApiError(400, "Activity is already cancelled");
    }

    // Check if activity date is in the past
    const activityDate = new Date(activity.date);
    const now = new Date();
    if (activityDate < now) {
      throw new ApiError(400, "Cannot cancel a past activity");
    }

    // Get participants for notification (before clearing them)
    const participantsToNotify = activity.participants || [];

    // Update activity as cancelled
    const cancelledActivity = await Activity.findByIdAndUpdate(
      id,
      {
        isCancelled: true,
        cancelledAt: new Date(),
        cancellationReason: reason.trim(),
        // Clear participants as activity is cancelled
        participants: []
      },
      { new: true, runValidators: true }
    )
      .populate("createdBy", "name email mobile profileImage")
      .lean();

    // TODO: Send notification/email to all participants about cancellation
    // You can implement email sending here using nodemailer or any email service
    console.log(`Activity ${id} cancelled. Participants to notify:`, participantsToNotify);

    // Notify Creator (Self-Confirmation)
    await sendNotification({
      recipient: userId,
      sender: userId,
      type: "ACTIVITY_CANCELLED_SELF",
      message: `You successfully cancelled the activity: ${activity.title}`,
      link: `/activity/${id}`,
      relatedId: id,
    });

    // Notify Participants
    for (const participantId of participantsToNotify) {
      if (participantId.toString() !== userId.toString()) {
        await sendNotification({
          recipient: participantId,
          sender: userId,
          type: "ACTIVITY_CANCELLED",
          message: `${req.user.name} cancelled the activity: ${activity.title}`,
          link: `/activity/${id}`,
          relatedId: id,
        });
      }
    }


    // Response
    return res.status(200).json(
      new ApiResponse(
        200,
        {
          activity: cancelledActivity,
          participantsNotified: participantsToNotify.length
        },
        "Activity cancelled successfully"
      )
    );
  }
);
