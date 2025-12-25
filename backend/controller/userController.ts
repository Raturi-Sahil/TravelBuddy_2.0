import { NextFunction,Request, Response } from "express";

import { uploadCoverImage, uploadProfileImage } from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";
import uploadProfileImageFromUrl from "../middlewares/uploadProfileImageFromUrl";
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

    const { clerk_id, name, email, profileImageUrl, mobile, dob, gender, nationality, languages } = parsed.data;
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

    // Check if user already exists by email
    const existingEmailUser = await User.findOne({ email });
    if (existingEmailUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // Upload profile image from Clerk to Cloudinary
    let profileImage = "";
    if (profileImageUrl) {
      const uploadedUrl = await uploadProfileImageFromUrl(profileImageUrl);
      if (uploadedUrl) {
        profileImage = uploadedUrl;
      }
    }

    const user = await User.create({
      clerk_id,
      name,
      email,
      profileImage,
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
    const user = await User.findById(userId)
      .populate({
        path: "JoinActivity",
        select: "title date startTime location photos category price maxCapacity participants createdBy isCancelled",
        populate: {
          path: "createdBy",
          select: "name profileImage"
        }
      });

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
      name,
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
      profileVisibility,
    } = parsed.data;

    // Handle file uploads (using multer.fields for coverImage and profileImage)
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    // Handle cover image upload
    if (files?.coverImage?.[0]) {
      const localFilePath = files.coverImage[0].path;

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

    // Handle profile image upload
    if (files?.profileImage?.[0]) {
      const localFilePath = files.profileImage[0].path;

      // Upload new image to Cloudinary
      const uploadResult = await uploadProfileImage(localFilePath);

      if (!uploadResult) {
        throw new ApiError(500, "Failed to upload profile image");
      }

      // Delete previous profile image from Cloudinary if exists
      if (user.profileImage) {
        await deleteFromCloudinaryByUrl(user.profileImage);
      }

      // Update user's profile image URL
      user.profileImage = uploadResult.secure_url;
    }

    // Update fields if provided (already validated by Zod)
    if (name) user.name = name;
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
    if (profileVisibility) user.profileVisibility = profileVisibility as "Public" | "Private";

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

      // Find users matching the filter - now includes name and profileImage from schema
      const nearbyUsers = await User.find(filter)
        .select("name profileImage gender travelStyle bio coverImage currentLocation nationality interests isOnline lastSeen")
        .lean();

      console.log("Found users:", nearbyUsers.length);

      // Map users with calculated distance - no Clerk API calls needed!
      let usersWithData = nearbyUsers.map((user: any) => {
        // Calculate distance if we have user's current location
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
          fullName: user.name || 'Anonymous',
          profilePicture: user.profileImage || user.coverImage || '',
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

// Get another user's profile by ID (with privacy controls)
export const getUserById = asyncHandler(
  async (req: Request | any, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const currentUserId = req.user?._id;

    // Find the target user
    const targetUser = await User.findById(id).lean();
    if (!targetUser) {
      throw new ApiError(404, "User not found");
    }

    // Get current user to check friend status
    const currentUser = await User.findById(currentUserId).lean();
    if (!currentUser) {
      throw new ApiError(404, "Current user not found");
    }

    // Check relationship status
    const isFriend = currentUser.friends?.some((f: any) => f.toString() === id);
    const hasSentRequest = currentUser.sentFriendRequests?.some((r: any) => r.toString() === id);
    const hasReceivedRequest = currentUser.friendRequests?.some((r: any) => r.toString() === id);

    // Determine if we should show full profile
    const isPublic = targetUser.profileVisibility === "Public";
    const showFullProfile = isPublic || isFriend;

    // Use stored user data - no Clerk API call needed!
    const fullName = targetUser.name || 'Anonymous';
    const profilePicture = targetUser.profileImage || '';

    // Calculate distance if both users have location
    let distanceKm: number | null = null;
    const currentLat = currentUser.currentLocation?.coordinates?.[1];
    const currentLng = currentUser.currentLocation?.coordinates?.[0];
    const targetLat = targetUser.currentLocation?.coordinates?.[1];
    const targetLng = targetUser.currentLocation?.coordinates?.[0];

    if (currentLat && currentLng && targetLat && targetLng &&
        currentLat !== 0 && currentLng !== 0 && targetLat !== 0 && targetLng !== 0) {
      const R = 6371;
      const dLat = (targetLat - currentLat) * Math.PI / 180;
      const dLng = (targetLng - currentLng) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(currentLat * Math.PI / 180) * Math.cos(targetLat * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      distanceKm = Math.round(R * c * 10) / 10;
    }

    // Build response based on privacy
    const baseProfile = {
      _id: targetUser._id,
      fullName,
      profilePicture,
      coverImage: targetUser.coverImage || '',
      nationality: targetUser.nationality,
      travelStyle: targetUser.travelStyle,
      bio: targetUser.bio,
      gender: targetUser.gender,
      isOnline: targetUser.isOnline,
      lastSeen: targetUser.lastSeen,
      distanceKm,
      profileVisibility: targetUser.profileVisibility,
      // Relationship status
      isFriend,
      hasSentRequest,
      hasReceivedRequest,
    };

    if (showFullProfile) {
      // Full profile for public users or friends
      return res.status(200).json(new ApiResponse(200, {
        ...baseProfile,
        interests: targetUser.interests || [],
        languages: targetUser.languages || [],
        socialLinks: targetUser.socialLinks || {},
        futureDestinations: targetUser.futureDestinations || [],
        createdAt: targetUser.createdAt,
      }, "User profile fetched successfully"));
    } else {
      // Limited profile for private users who are not friends
      return res.status(200).json(new ApiResponse(200, {
        ...baseProfile,
        isPrivate: true,
      }, "Limited profile (private user)"));
    }
  }
);
