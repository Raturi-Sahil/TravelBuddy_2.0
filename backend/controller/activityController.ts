import {Request, Response } from "express";
import mongoose from "mongoose";

import uploadOnCloudinary from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";
import { Activity } from "../models/activityModel";
import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
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
        date: { $gte: now}
      })
      .sort({date: 1, startTime: 1})
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

export const getActivityById = asyncHandler(
  async (req: Request, res: Response) => { 
  
    const {id} = req.params;

    //Validate the objectId.
    if(!mongoose.Types.ObjectId.isValid(id)) {
       throw new ApiError(
          400, 
          "Invalid activity id"
       );
    }

    //Fetch activity
    const activity =  await Activity.findById(id).populate("createdBy", "name email mobile profileImage").lean();

    //Handle, if the activity not found.
    if(!activity) {
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
  
    const {id} = req.params;

    //Validate the objectId.
    if(!mongoose.Types.ObjectId.isValid(id)) {
       throw new ApiError(
          400, 
          "Invalid activity id"
       );
    }

    //Fetch activity
    const activity =  await Activity.findById(id)
    .select("participants")
    .populate("participants", "name profileImage")
    .lean();

    //Handle, if the activity not found.
    if(!activity) {
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
    if(!req.user) {
        throw new ApiError(
          401, 
          "Unauthorized"
       );
    }

    const updateActivityZodSchema = activityZodSchema.partial();
    const validatedData = updateActivityZodSchema.parse(req.body);

    const userId = req.user._id;

    const {id} = req.params;

    //Validate the objectId.
    if(!mongoose.Types.ObjectId.isValid(id)) {
       throw new ApiError(
          400, 
          "Invalid activity id"
       );
    }

    //Fetch activity
    const activity =  await Activity.findById(id);

    //Handle, if the activity not found.
    if(!activity) {
      throw new ApiError(
          404, 
          "Requested Activity doesn't exist"
       );
    }

    if(activity.createdBy.toString() !== userId.toString()) {
      throw new ApiError(
          403, 
          "You are not allowed to update this activity"
       );
    }

    //update the activity
    const updatedActivity = await Activity.findByIdAndUpdate(
        id,
        validatedData,
        {new: true, runValidators: true}
    )
    .populate("createdBy", "name email mobile profileImage")
    .lean();

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
    if(!req.user) {
        throw new ApiError(
          401, 
          "Unauthorized"
       );
    }

    const userId = req.user._id;

    const {id} = req.params;

    //Validate the objectId.
    if(!mongoose.Types.ObjectId.isValid(id)) {
       throw new ApiError(
          400, 
          "Invalid activity id"
       );
    }

    //Fetch activity
    const activity =  await Activity.findById(id);

    //Handle, if the activity not found.
    if(!activity) {
      throw new ApiError(
          404, 
          "Requested Activity doesn't exist"
       );
    }

    if(activity.participants.some(
      (participantId) => participantId.toString() === userId.toString()
    )) {
      throw new ApiError(
          409, 
          "conflict"
       );
    }

    //check if space is available
    if (activity.participants.length >= activity.maxCapacity) {
      throw new ApiError(409, "Activity is already full");
    }

    //update the activity
    const updatedActivity = await Activity.findByIdAndUpdate(
        id,
        { $addToSet: { participants: userId } },
        {new: true, runValidators: true}
    )
    .populate("createdBy", "name email mobile profileImage")
    .lean();

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
    if(!req.user) {
        throw new ApiError(
          401, 
          "Unauthorized"
       );
    }

    const userId = req.user._id;

    const {id} = req.params;

    //Validate the objectId.
    if(!mongoose.Types.ObjectId.isValid(id)) {
       throw new ApiError(
          400, 
          "Invalid activity id"
       );
    }

    //Fetch activity
    const activity =  await Activity.findById(id);

    //Handle, if the activity not found.
    if(!activity) {
      throw new ApiError(
          404, 
          "Requested Activity doesn't exist"
       );
    }

    if(!activity.participants.some(
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
        {new: true, runValidators: true}
    )
    .populate("createdBy", "name email mobile profileImage")
    .lean();

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