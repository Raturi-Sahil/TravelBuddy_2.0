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

// Get travelers - can filter by location (optional) and/or search by name
export const getNearbyTravelers = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const { lat, lng, radius, search, page, limit } = req.query;

    // Parse optional location parameters
    const latitude = lat ? parseFloat(lat as string) : null;
    const longitude = lng ? parseFloat(lng as string) : null;
    const searchRadius = parseInt(radius as string) || 20000; // Default 20km in meters
    const searchQuery = (search as string)?.trim() || '';
    
    // Pagination parameters
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50)); // Default 50, max 100

    // Get current user ID to exclude from results
    const currentUserId = req.user?._id;
    
    // Get current user's location for distance calculation
    const currentUser = await User.findById(currentUserId).select("currentLocation").lean();
    const userLat = currentUser?.currentLocation?.coordinates?.[1] || latitude;
    const userLng = currentUser?.currentLocation?.coordinates?.[0] || longitude;

    try {
      // Build query filter
      const filter: any = {
        profileVisibility: "Public",
      };

      // Add location filter if coordinates provided (for radius-based search)
      if (latitude !== null && longitude !== null && !isNaN(latitude) && !isNaN(longitude)) {
        const radiusInRadians = searchRadius / 6378100;
        
        filter["currentLocation.type"] = "Point";
        filter.$and = [
          { "currentLocation.coordinates": { $ne: [0, 0] } },
          {
            "currentLocation.coordinates": {
              $geoWithin: {
                $centerSphere: [[longitude, latitude], radiusInRadians]
              }
            }
          }
        ];
        
        console.log("Searching with location:", { latitude, longitude, searchRadius, radiusInRadians });
      }

      // Exclude current user if authenticated
      if (currentUserId) {
        filter._id = { $ne: currentUserId };
      }

      console.log("Query filter:", JSON.stringify(filter, null, 2));

      // Find users matching the filter
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

      // Merge with Clerk data and always calculate distance if we have user location
      let usersWithData = nearbyUsers.map((user: any) => {
        // Get Clerk user data
        const clerkData = clerkUsersMap[user.clerk_id] || { fullName: 'Anonymous', imageUrl: '' };

        // Always calculate distance if we have user's current location
        let distanceKm: number | null = null;
        let distanceMeters: number | null = null;
        
        if (userLat && userLng) {
          const targetLng = user.currentLocation?.coordinates?.[0] || 0;
          const targetLat = user.currentLocation?.coordinates?.[1] || 0;

          if (targetLng !== 0 && targetLat !== 0) {
            // Calculate distance using Haversine formula
            const R = 6371; // Earth's radius in km
            const dLat = (targetLat - userLat) * Math.PI / 180;
            const dLng = (targetLng - userLng) * Math.PI / 180;
            const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                      Math.cos(userLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
                      Math.sin(dLng / 2) * Math.sin(dLng / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distanceKm = Math.round(R * c * 10) / 10;
            distanceMeters = distanceKm * 1000;
          }
        }

        return {
          ...user,
          fullName: clerkData.fullName,
          profilePicture: clerkData.imageUrl || user.coverImage || '',
          distanceMeters,
          distanceKm,
        };
      });

      // Filter by name search if provided
      if (searchQuery) {
        const lowerSearch = searchQuery.toLowerCase();
        usersWithData = usersWithData.filter((user: any) => 
          user.fullName.toLowerCase().includes(lowerSearch)
        );
        console.log(`Filtered by name "${searchQuery}":`, usersWithData.length);
      }

      // Sort by distance if available, otherwise by name
      usersWithData.sort((a: any, b: any) => {
        if (a.distanceKm !== null && b.distanceKm !== null) {
          return a.distanceKm - b.distanceKm;
        } else if (a.distanceKm !== null) {
          return -1; // Users with distance come first
        } else if (b.distanceKm !== null) {
          return 1;
        }
        return a.fullName.localeCompare(b.fullName);
      });

      // Apply pagination
      const totalCount = usersWithData.length;
      const totalPages = Math.ceil(totalCount / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedUsers = usersWithData.slice(startIndex, startIndex + limitNum);

      console.log(`Users found: ${totalCount}, Page: ${pageNum}/${totalPages}, Showing: ${paginatedUsers.length}`);
      
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            {
              users: paginatedUsers,
              pagination: {
                page: pageNum,
                limit: limitNum,
                totalCount,
                totalPages,
                hasMore: pageNum < totalPages,
              }
            },
            `Found ${totalCount} travelers (Page ${pageNum}/${totalPages})`
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
