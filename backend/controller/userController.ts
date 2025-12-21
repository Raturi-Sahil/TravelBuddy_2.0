import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextFunction,Request, Response } from "express";

import { uploadCoverImage } from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";
import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { registerUserSchema, updateProfileSchema } from "../validation/userValidation";

export const registerUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const parsed = registerUserSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      throw new ApiError(400, "Invalid input data", errors);
    }

    const { clerk_id, mobile, dob, gender, nationality, languages } = parsed.data;
    const inputDob = new Date(dob);

    // Check if user already exists by clerk_id
    const existingUser = await User.findOne({ clerk_id });
    if (existingUser) {
      throw new ApiError(400, "User already registered");
    }

    // Verify Clerk ID matches the authenticated user
    const authUserId = (req as any).auth?.userId;
    if (authUserId && authUserId !== clerk_id) {
       throw new ApiError(403, "Forbidden: Clerk ID mismatch");
    }

    // Check if user already exists by mobile
    const existingMobileUser = await User.findOne({ mobile });
    if (existingMobileUser) {
      throw new ApiError(409, "User with this mobile number already exists");
    }

    const user = await User.create({
      clerk_id,
      mobile,
      dob: inputDob,
      gender,
      nationality,
      languages: languages as any,
    });

    return res.status(201).json(
      new ApiResponse(201, user, "User registered successfully")
    );
  }
);

export const getProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
         throw new ApiError(404, "User not found");
    }

    // Lazy check for subscription expiration
    if (user.planType === "Monthly" || user.planType === "Yearly") {
        if (user.planEndDate && new Date() > new Date(user.planEndDate)) {
             user.planType = "None";
             user.planEndDate = null;
             user.planStartDate = null;
             await user.save();
        }
    }

    // Check if Single plan has consumed all activities (though this should be handled at usage time)
    if (user.planType === "Single" && user.remainingActivityCount <= 0) {
        user.planType = "None";
        await user.save();
    }

    return res.status(200).json(new ApiResponse(200, user, "User Profile Fetched Successfully"));
  }
);

export const updateProfile = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    // When using FormData (for file uploads), nested objects are sent as JSON strings
    // Parse them back to objects before validation
    const bodyToValidate = { ...req.body };

    // Fields that might be JSON strings when sent via FormData
    const jsonFields = ['languages', 'interests', 'socialLinks', 'futureDestinations'];

    for (const field of jsonFields) {
      if (bodyToValidate[field] && typeof bodyToValidate[field] === 'string') {
        try {
          bodyToValidate[field] = JSON.parse(bodyToValidate[field]);
        } catch (e) {
          // If parsing fails, leave as-is and let Zod validation catch it
        }
      }
    }

    // Validate request body with Zod
    const parsed = updateProfileSchema.safeParse(bodyToValidate);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => issue.message);
      throw new ApiError(400, "Invalid input data", errors);
    }

    const userId = req.user?._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const {
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
    } = parsed.data;

    // Handle cover image upload
    if (req.file) {
      const localFilePath = req.file.path;

      // Upload new image to Cloudinary
      const uploadResult = await uploadCoverImage(localFilePath);

      if (!uploadResult) {
        throw new ApiError(500, "Failed to upload cover image");
      }

      // Delete previous cover image from Cloudinary if exists
      if (user.coverImage) {
        await deleteFromCloudinaryByUrl(user.coverImage);
      }

      // Update user's cover image URL
      user.coverImage = uploadResult.secure_url;
    }

    // Update fields if provided (already validated by Zod)
    if (mobile) user.mobile = mobile;
    if (dob) user.dob = new Date(dob);
    if (gender) user.gender = gender;
    if (travelStyle) user.travelStyle = travelStyle;
    if (bio) user.bio = bio;
    if (nationality) user.nationality = nationality;
    if (interests) user.interests = interests;
    if (languages) user.languages = languages as any;
    if (futureDestinations) user.futureDestinations = futureDestinations as any;
    if (socialLinks) user.socialLinks = { ...user.socialLinks, ...socialLinks };

    await user.save();

    return res
      .status(200)
      .json(new ApiResponse(200, user, "Profile updated successfully"));
  }
);

// Get nearby travelers based on location
export const getNearbyTravelers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const { lat, lng, radius } = req.query;

    // Validate required parameters
    if (!lat || !lng) {
      throw new ApiError(400, "Latitude and longitude are required");
    }

    const latitude = parseFloat(lat as string);
    const longitude = parseFloat(lng as string);
    const searchRadius = parseInt(radius as string) || 20000; // Default 20km in meters

    if (isNaN(latitude) || isNaN(longitude)) {
      throw new ApiError(400, "Invalid latitude or longitude");
    }

    // Get current user ID to exclude from results
    const currentUserId = req.user?._id;

    try {
      // Convert radius from meters to radians for $centerSphere (divide by Earth's radius in meters)
      const radiusInRadians = searchRadius / 6378100;

      console.log("Searching for nearby travelers:", { latitude, longitude, searchRadius, radiusInRadians });

      // Build query filter - use $and to combine conditions properly
      const filter: any = {
        profileVisibility: "Public",
        "currentLocation.type": "Point",
        $and: [
          { "currentLocation.coordinates": { $ne: [0, 0] } },  // Exclude users without real location
          {
            "currentLocation.coordinates": {
              $geoWithin: {
                $centerSphere: [[longitude, latitude], radiusInRadians]
              }
            }
          }
        ]
      };

      // Exclude current user if authenticated
      if (currentUserId) {
        filter._id = { $ne: currentUserId };
      }

      console.log("Query filter:", JSON.stringify(filter, null, 2));

      // Find nearby users
      // Find all nearby users within the radius (no limit)
      const nearbyUsers = await User.find(filter)
        .select("clerk_id gender travelStyle bio coverImage currentLocation nationality interests isOnline lastSeen")
        .lean();

      console.log("Found users:", nearbyUsers.length);

      // Fetch Clerk user data for all nearby users
      const clerkUserIds = nearbyUsers.map((user: any) => user.clerk_id);
      let clerkUsersMap: Record<string, { fullName: string; imageUrl: string }> = {};

      if (clerkUserIds.length > 0) {
        try {
          const clerkUsers = await clerkClient.users.getUserList({
            userId: clerkUserIds,
          });
          
          // Clerk v4 returns array directly, handle both cases for compatibility
          const usersList = Array.isArray(clerkUsers) ? clerkUsers : (clerkUsers as any).data || [];
          
          clerkUsersMap = usersList.reduce((acc: any, clerkUser: any) => {
            acc[clerkUser.id] = {
              fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Anonymous',
              imageUrl: clerkUser.imageUrl || '',
            };
            return acc;
          }, {});
        } catch (clerkError) {
          console.error("Error fetching Clerk users:", clerkError);
          // Continue without Clerk data
        }
      }

      // Calculate distance and merge with Clerk data
      const usersWithDistance = nearbyUsers.map((user: any) => {
        const userLng = user.currentLocation?.coordinates?.[0] || 0;
        const userLat = user.currentLocation?.coordinates?.[1] || 0;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = (userLat - latitude) * Math.PI / 180;
        const dLng = (userLng - longitude) * Math.PI / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(latitude * Math.PI / 180) * Math.cos(userLat * Math.PI / 180) *
                  Math.sin(dLng / 2) * Math.sin(dLng / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = Math.round(R * c * 10) / 10; // Round to 1 decimal

        // Get Clerk user data
        const clerkData = clerkUsersMap[user.clerk_id] || { fullName: 'Anonymous', imageUrl: '' };

        return {
          ...user,
          fullName: clerkData.fullName,
          profilePicture: clerkData.imageUrl || user.coverImage || '',
          distanceMeters: distanceKm * 1000,
          distanceKm,
        };
      });

      // Sort by distance
      usersWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

      console.log("Nearby users found:", usersWithDistance.length);
      
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            usersWithDistance,
            `Found ${usersWithDistance.length} travelers nearby`
          )
        );
    } catch (error: any) {
      console.error("Error in getNearbyTravelers:", error);
      
      // If it's a geospatial index error, return empty array instead of failing
      if (error.code === 2 || error.message?.includes("geo")) {
        console.log("No users with valid location data found");
        return res
          .status(200)
          .json(
            new ApiResponse(200, [], "No travelers nearby")
          );
      }
      
      throw new ApiError(500, `Failed to find nearby travelers: ${error.message}`);
    }
  }
);
