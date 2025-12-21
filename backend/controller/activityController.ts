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
    
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = req.user;
    const userId = user._id;
    const now = new Date();

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

    const uploadedImageUrls: string[] = [];

    try {
      for (const file of files) {
        const result = await uploadOnCloudinary(file.path);
        if (!result) {
          throw new ApiError(500, "Image upload failed");
        }
        uploadedImageUrls.push(result.secure_url);
      }
    } catch (err) {
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

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // CREATE ACTIVITY
      const [activity] = await Activity.create(
        [
          {
            ...validatedData,
            location,
            photos: uploadedImageUrls,
            createdBy: userId,
            participants: [userId],
          },
        ],
        { session }
      );

      if (!activity) {
        throw new ApiError(500, "Failed to create activity");
      }

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

      await User.findByIdAndUpdate(userId, userUpdate, { session });

      await session.commitTransaction();
      session.endSession();

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
      await session.abortTransaction();
      session.endSession();

      // cleanup uploaded images if DB fails
      for (const url of uploadedImageUrls) {
        await deleteFromCloudinaryByUrl(url);
      }

      throw err;
    }
  }
);

