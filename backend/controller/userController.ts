import { Request, Response, NextFunction } from "express";
import { User } from "../models/userModel";

import ApiError from "../utils/apiError";
import asyncHandler from "../utils/asyncHandler";
import ApiResponse from "../utils/apiResponse";
import { registerUserSchema } from "../validation/registerUserSchema";

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      throw new ApiError(400, "Invalid input data", errors);
    }

    const { clerk_id, fullName, email, mobile, dob, gender } = parsed.data;
    const inputDob = new Date(dob);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(400, "Email already exists");
    }

    const user = await User.create({
      clerk_id,
      fullName: fullName.trim(),
      email,
      mobile,
      dob: inputDob,
      gender,
    });

    const token = user.generateJwtToken();

    return res
      .status(201)
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json(
        new ApiResponse(201, { user, token }, "User registered successfully")
      );
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    return res.status(200).json(new ApiResponse(200, req.user as any, "User Profile Fetched Successfully"));
  }
);

import uploadOnCloudinary from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";

export const updateProfile = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const {
      fullName,
      mobile,
      dob,
      gender,
      travelStyle,
      bio,
      nationality,
      interests,
      socialLinks,
      languages,
      futureDestinations,
    } = req.body;

    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // 1. Update basic fields if provided
    if (fullName) user.fullName = fullName.trim();
    // Email update removed as per requirements
    // if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (dob) user.dob = new Date(dob);
    if (gender) user.gender = gender;
    if (travelStyle) user.travelStyle = travelStyle;
    if (bio) user.bio = bio;
    if (nationality) user.nationality = nationality;

    // 2. Update Array/Object fields
    // Ensure interests is an array if provided as string or array
    if (interests) {
        if (typeof interests === "string") {
            try {
                 user.interests = JSON.parse(interests);
            } catch (e) {
                user.interests = [interests];
            }
        } else {
            user.interests = interests;
        }
    }

     if (futureDestinations) {
        if (typeof futureDestinations === "string") {
            try {
                 user.futureDestinations = JSON.parse(futureDestinations);
            } catch (e) {
                 // handle error
            }
        } else {
             user.futureDestinations = futureDestinations;
        }
    }

    if (socialLinks) {
         if (typeof socialLinks === "string") {
            try {
                 user.socialLinks = JSON.parse(socialLinks);
            } catch (e) {
                 // handle parsing error or ignore
            }
        } else {
             user.socialLinks = { ...user.socialLinks, ...socialLinks };
        }
    }

    if (languages) {
        if (typeof languages === "string") {
             try {
                user.languages = JSON.parse(languages);
             } catch (e) {
                // handle error
             }
        } else {
            user.languages = languages;
        }
    }

    // 3. Handle Profile Picture Upload
    if (req.file) {
      const localFilePath = req.file.path;
      const cloudinaryResponse = await uploadOnCloudinary(localFilePath);

      if (cloudinaryResponse && cloudinaryResponse.url) {
        // Delete old profile picture if it's not the default one
        const DEFAULT_PROFILE_PICTURE = "https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg";
        
        if (
          user.profilePicture &&
          user.profilePicture !== DEFAULT_PROFILE_PICTURE
        ) {
          await deleteFromCloudinaryByUrl(user.profilePicture);
        }

        user.profilePicture = cloudinaryResponse.url;
      }
    }

    // 4. Check Profile Completion
    // A simple check: ensure required fields and some optional ones are present
    const isProfileComplete = 
      !!user.fullName &&
      !!user.email &&
      !!user.mobile &&
      !!user.dob &&
      !!user.gender &&
      !!user.travelStyle &&
      !!user.nationality &&
      user.nationality !== "Not Specified" &&
      !!user.bio &&
      user.bio !== "Not Updated Yet" && 
      (user.interests && user.interests.length > 0) &&
      (user.languages && user.languages.length > 0);

      user.profileCompleted = isProfileComplete;

    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  }
);
