import { Request, Response } from "express";
import mongoose from "mongoose";

import uploadOnCloudinary from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";
import { Transport, TransportReview, TransportContact } from "../models/transportModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

// ==================== TRANSPORT LISTING MANAGEMENT ====================

// Create transport listing
export const createTransportListing = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const {
      vehicleType,
      vehicleName,
      vehicleNumber,
      seatingCapacity,
      route,
      serviceArea,
      lat,
      lng,
      minPrice,
      maxPrice,
      priceType,
      phone,
      whatsapp,
      features,
      languages,
      description,
    } = req.body;

    // Parse JSON fields if they come as strings
    let parsedFeatures = features;
    let parsedLanguages = languages;

    if (typeof features === "string") {
      parsedFeatures = JSON.parse(features);
    }
    if (typeof languages === "string") {
      parsedLanguages = JSON.parse(languages);
    }

    // Upload images to Cloudinary
    const vehicleImages: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const result = await uploadOnCloudinary(file.path);
        if (result?.url) {
          vehicleImages.push(result.url);
        }
      }
    }

    const transport = await Transport.create({
      owner: userId,
      vehicleType,
      vehicleName,
      vehicleNumber,
      seatingCapacity: Number(seatingCapacity),
      vehicleImages,
      route,
      serviceArea,
      serviceAreaCoordinates: lat && lng ? {
        type: "Point",
        coordinates: [Number(lng), Number(lat)],
      } : undefined,
      minPrice: Number(minPrice),
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      priceType: priceType || "per_trip",
      phone,
      whatsapp,
      features: parsedFeatures || [],
      languages: parsedLanguages || [],
      description,
      listingStatus: "approved", // Auto-approve for MVP
      isVerified: true, // Auto-verify for MVP
    });

    const populatedTransport = await Transport.findById(transport._id).populate(
      "owner",
      "name email profileImage"
    );

    return res.status(201).json(
      new ApiResponse(201, populatedTransport, "Transport listing created successfully")
    );
  }
);

// Update transport listing
export const updateTransportListing = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const userId = req.user._id;

    const transport = await Transport.findOne({ _id: id, owner: userId });

    if (!transport) {
      throw new ApiError(404, "Transport listing not found or you don't have permission");
    }

    const {
      vehicleName,
      vehicleNumber,
      seatingCapacity,
      route,
      serviceArea,
      lat,
      lng,
      minPrice,
      maxPrice,
      priceType,
      phone,
      whatsapp,
      features,
      languages,
      description,
      existingImages,
    } = req.body;

    // Parse existing images
    let parsedExistingImages: string[] = [];
    if (typeof existingImages === "string") {
      parsedExistingImages = JSON.parse(existingImages);
    } else if (Array.isArray(existingImages)) {
      parsedExistingImages = existingImages;
    }

    // Upload new images
    const newImageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files as Express.Multer.File[]) {
        const result = await uploadOnCloudinary(file.path);
        if (result?.url) {
          newImageUrls.push(result.url);
        }
      }
    }

    // Delete removed images from Cloudinary
    const imagesToDelete = transport.vehicleImages.filter(
      (url) => !parsedExistingImages.includes(url)
    );
    for (const url of imagesToDelete) {
      await deleteFromCloudinaryByUrl(url);
    }

    // Combine existing and new images
    const finalImages = [...parsedExistingImages, ...newImageUrls];

    // Parse JSON fields
    let parsedFeatures = features;
    let parsedLanguages = languages;

    if (typeof features === "string") {
      parsedFeatures = JSON.parse(features);
    }
    if (typeof languages === "string") {
      parsedLanguages = JSON.parse(languages);
    }

    const updateData: any = {
      vehicleImages: finalImages,
    };

    if (vehicleName) updateData.vehicleName = vehicleName;
    if (vehicleNumber !== undefined) updateData.vehicleNumber = vehicleNumber;
    if (seatingCapacity) updateData.seatingCapacity = Number(seatingCapacity);
    if (route) updateData.route = route;
    if (serviceArea) updateData.serviceArea = serviceArea;
    if (lat && lng) {
      updateData.serviceAreaCoordinates = {
        type: "Point",
        coordinates: [Number(lng), Number(lat)],
      };
    }
    if (minPrice) updateData.minPrice = Number(minPrice);
    if (maxPrice !== undefined) updateData.maxPrice = maxPrice ? Number(maxPrice) : undefined;
    if (priceType) updateData.priceType = priceType;
    if (phone) updateData.phone = phone;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
    if (parsedFeatures) updateData.features = parsedFeatures;
    if (parsedLanguages) updateData.languages = parsedLanguages;
    if (description !== undefined) updateData.description = description;

    const updatedTransport = await Transport.findByIdAndUpdate(
      transport._id,
      updateData,
      { new: true }
    ).populate("owner", "name email profileImage");

    return res.status(200).json(
      new ApiResponse(200, updatedTransport, "Transport listing updated successfully")
    );
  }
);

// Toggle transport availability
export const toggleTransportAvailability = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const userId = req.user._id;

    const transport = await Transport.findOne({ _id: id, owner: userId });

    if (!transport) {
      throw new ApiError(404, "Transport listing not found");
    }

    transport.isAvailable = !transport.isAvailable;
    await transport.save();

    return res.status(200).json(
      new ApiResponse(200, { isAvailable: transport.isAvailable }, "Availability toggled successfully")
    );
  }
);

// Delete transport listing
export const deleteTransportListing = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const userId = req.user._id;

    const transport = await Transport.findOne({ _id: id, owner: userId });

    if (!transport) {
      throw new ApiError(404, "Transport listing not found");
    }

    // Delete images from Cloudinary
    for (const url of transport.vehicleImages) {
      await deleteFromCloudinaryByUrl(url);
    }

    await Transport.findByIdAndDelete(id);

    return res.status(200).json(
      new ApiResponse(200, null, "Transport listing deleted successfully")
    );
  }
);

// Get my transport listings
export const getMyTransportListings = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;

    const transports = await Transport.find({ owner: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json(
      new ApiResponse(200, transports, "My transport listings fetched successfully")
    );
  }
);

// ==================== BROWSE TRANSPORTS ====================

// Get all transports with filters
export const getTransports = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      search,
      vehicleType,
      minSeats,
      minPrice,
      maxPrice,
      availability,
      verifiedOnly,
      sortBy = "rating",
      page = 1,
      limit = 20,
    } = req.query;

    const query: any = {
      isActive: true,
      listingStatus: "approved",
    };

    // Search
    if (search) {
      query.$or = [
        { route: { $regex: search, $options: "i" } },
        { serviceArea: { $regex: search, $options: "i" } },
        { vehicleName: { $regex: search, $options: "i" } },
      ];
    }

    // Vehicle type filter
    if (vehicleType && vehicleType !== "All") {
      query.vehicleType = vehicleType;
    }

    // Minimum seats filter
    if (minSeats) {
      query.seatingCapacity = { $gte: Number(minSeats) };
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query.minPrice = {};
      if (minPrice) query.minPrice.$gte = Number(minPrice);
      if (maxPrice) query.minPrice.$lte = Number(maxPrice);
    }

    // Availability filter
    if (availability === "Available Only" || availability === "true") {
      query.isAvailable = true;
    }

    // Verified only filter
    if (verifiedOnly === "true") {
      query.isVerified = true;
    }

    // Sorting
    let sortOption: any = { averageRating: -1 };
    if (sortBy === "price_low") sortOption = { minPrice: 1 };
    if (sortBy === "price_high") sortOption = { minPrice: -1 };
    if (sortBy === "newest") sortOption = { createdAt: -1 };
    if (sortBy === "reviews") sortOption = { totalReviews: -1 };

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Transport.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    const transports = await Transport.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("owner", "name email profileImage")
      .lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          transports,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
            hasMore: pageNum < totalPages,
          },
        },
        "Transports fetched successfully"
      )
    );
  }
);

// Get nearby transports
export const getNearbyTransports = asyncHandler(
  async (req: Request, res: Response) => {
    const { lat, lng, maxDistance = 50000, limit = 20 } = req.query;

    if (!lat || !lng) {
      throw new ApiError(400, "Latitude and longitude are required");
    }

    const transports = await Transport.find({
      isActive: true,
      listingStatus: "approved",
      serviceAreaCoordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(maxDistance),
        },
      },
    })
      .limit(Number(limit))
      .populate("owner", "name email profileImage")
      .lean();

    return res.status(200).json(
      new ApiResponse(200, transports, "Nearby transports fetched successfully")
    );
  }
);

// Get transport by ID
export const getTransportById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid transport ID");
    }

    const transport = await Transport.findById(id)
      .populate("owner", "name email profileImage mobile")
      .lean();

    if (!transport) {
      throw new ApiError(404, "Transport not found");
    }

    return res.status(200).json(
      new ApiResponse(200, transport, "Transport fetched successfully")
    );
  }
);

// ==================== CONTACT LOGGING ====================

// Log contact (for analytics)
export const logContact = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const { contactType } = req.body;

    if (!["call", "whatsapp"].includes(contactType)) {
      throw new ApiError(400, "Invalid contact type");
    }

    const transport = await Transport.findById(id);

    if (!transport) {
      throw new ApiError(404, "Transport not found");
    }

    // Log the contact
    await TransportContact.create({
      transport: id,
      user: req.user._id,
      contactType,
    });

    // Increment contact count
    await Transport.findByIdAndUpdate(id, { $inc: { totalContacts: 1 } });

    return res.status(200).json(
      new ApiResponse(200, null, "Contact logged successfully")
    );
  }
);

// ==================== REVIEWS ====================

// Create review
export const createTransportReview = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }

    if (!comment || comment.trim().length < 10) {
      throw new ApiError(400, "Comment must be at least 10 characters");
    }

    const transport = await Transport.findById(id);

    if (!transport) {
      throw new ApiError(404, "Transport not found");
    }

    // Check if user already reviewed
    const existingReview = await TransportReview.findOne({
      transport: id,
      reviewer: req.user._id,
    });

    if (existingReview) {
      throw new ApiError(400, "You have already reviewed this transport");
    }

    // Create review
    const review = await TransportReview.create({
      transport: id,
      reviewer: req.user._id,
      rating,
      comment: comment.trim(),
    });

    // Update transport stats
    const allReviews = await TransportReview.find({ transport: id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Transport.findByIdAndUpdate(id, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    const populatedReview = await TransportReview.findById(review._id).populate(
      "reviewer",
      "name profileImage"
    );

    return res.status(201).json(
      new ApiResponse(201, populatedReview, "Review created successfully")
    );
  }
);

// Get transport reviews
export const getTransportReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const reviews = await TransportReview.find({ transport: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("reviewer", "name profileImage")
      .lean();

    const totalCount = await TransportReview.countDocuments({ transport: id });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          reviews,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages: Math.ceil(totalCount / limitNum),
          },
        },
        "Reviews fetched successfully"
      )
    );
  }
);
