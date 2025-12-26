import { Request, Response } from "express";
import mongoose from "mongoose";

import uploadOnCloudinary from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";
import { Guide, GuideBooking, GuideReview } from "../models/guideModel";
import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

// ==================== GUIDE PROFILE MANAGEMENT ====================

// Create guide profile
export const createGuideProfile = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;

    // Check if guide profile already exists
    const existingGuide = await Guide.findOne({ user: userId });
    if (existingGuide) {
      throw new ApiError(400, "Guide profile already exists");
    }

    const {
      city,
      lat,
      lng,
      specialties,
      languages,
      pricePerHour,
      experience,
      bio,
      availability,
    } = req.body;

    // Handle image uploads
    const files = req.files as Express.Multer.File[];
    const uploadedImageUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadOnCloudinary(file.path);
        if (result) {
          uploadedImageUrls.push(result.secure_url);
        }
      }
    }

    // Parse JSON fields if they come as strings
    let parsedLanguages = languages;
    let parsedSpecialties = specialties;
    let parsedAvailability = availability;

    if (typeof languages === "string") {
      parsedLanguages = JSON.parse(languages);
    }
    if (typeof specialties === "string") {
      parsedSpecialties = JSON.parse(specialties);
    }
    if (typeof availability === "string") {
      parsedAvailability = JSON.parse(availability);
    }

    const guide = await Guide.create({
      user: userId,
      city,
      cityCoordinates: {
        type: "Point",
        coordinates: [Number(lng), Number(lat)],
      },
      specialties: parsedSpecialties || [],
      languages: parsedLanguages || [],
      pricePerHour: Number(pricePerHour),
      experience: Number(experience) || 0,
      bio: bio || "",
      coverImages: uploadedImageUrls,
      availability: parsedAvailability || [],
    });

    // Update user's isLocalGuide flag
    await User.findByIdAndUpdate(userId, { isLocalGuide: true });

    const populatedGuide = await Guide.findById(guide._id).populate(
      "user",
      "name email profileImage"
    );

    return res.status(201).json(
      new ApiResponse(201, populatedGuide, "Guide profile created successfully")
    );
  }
);

// Update guide profile
export const updateGuideProfile = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const guide = await Guide.findOne({ user: userId });

    if (!guide) {
      throw new ApiError(404, "Guide profile not found");
    }

    const {
      city,
      lat,
      lng,
      specialties,
      languages,
      pricePerHour,
      experience,
      bio,
      availability,
      existingImages,
    } = req.body;

    // Handle new image uploads
    const files = req.files as Express.Multer.File[];
    const newImageUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const result = await uploadOnCloudinary(file.path);
        if (result) {
          newImageUrls.push(result.secure_url);
        }
      }
    }

    // Parse existing images
    let parsedExistingImages: string[] = [];
    if (existingImages) {
      parsedExistingImages = typeof existingImages === "string" 
        ? JSON.parse(existingImages) 
        : existingImages;
    }

    // Delete removed images from Cloudinary
    const imagesToDelete = guide.coverImages.filter(
      (img) => !parsedExistingImages.includes(img)
    );
    for (const url of imagesToDelete) {
      await deleteFromCloudinaryByUrl(url);
    }

    // Combine existing and new images
    const finalImages = [...parsedExistingImages, ...newImageUrls];

    // Parse JSON fields
    let parsedLanguages = languages;
    let parsedSpecialties = specialties;
    let parsedAvailability = availability;

    if (typeof languages === "string") {
      parsedLanguages = JSON.parse(languages);
    }
    if (typeof specialties === "string") {
      parsedSpecialties = JSON.parse(specialties);
    }
    if (typeof availability === "string") {
      parsedAvailability = JSON.parse(availability);
    }

    // Update guide
    const updateData: any = {
      coverImages: finalImages,
    };

    if (city) updateData.city = city;
    if (lat && lng) {
      updateData.cityCoordinates = {
        type: "Point",
        coordinates: [Number(lng), Number(lat)],
      };
    }
    if (parsedSpecialties) updateData.specialties = parsedSpecialties;
    if (parsedLanguages) updateData.languages = parsedLanguages;
    if (pricePerHour !== undefined) updateData.pricePerHour = Number(pricePerHour);
    if (experience !== undefined) updateData.experience = Number(experience);
    if (bio !== undefined) updateData.bio = bio;
    if (parsedAvailability) updateData.availability = parsedAvailability;

    const updatedGuide = await Guide.findByIdAndUpdate(
      guide._id,
      updateData,
      { new: true }
    ).populate("user", "name email profileImage");

    return res.status(200).json(
      new ApiResponse(200, updatedGuide, "Guide profile updated successfully")
    );
  }
);

// Toggle guide active status
export const toggleGuideStatus = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const guide = await Guide.findOne({ user: userId });

    if (!guide) {
      throw new ApiError(404, "Guide profile not found");
    }

    guide.isActive = !guide.isActive;
    await guide.save();

    // Update user's isLocalGuide flag
    await User.findByIdAndUpdate(userId, { isLocalGuide: guide.isActive });

    return res.status(200).json(
      new ApiResponse(
        200,
        { isActive: guide.isActive },
        `Guide mode ${guide.isActive ? "enabled" : "disabled"}`
      )
    );
  }
);

// Get my guide profile
export const getMyGuideProfile = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const guide = await Guide.findOne({ user: userId }).populate(
      "user",
      "name email profileImage mobile"
    );

    return res.status(200).json(
      new ApiResponse(200, guide, "Guide profile fetched successfully")
    );
  }
);

// Get guide by ID
export const getGuideById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid guide ID");
    }

    const guide = await Guide.findById(id).populate(
      "user",
      "name email profileImage mobile nationality languages"
    );

    if (!guide) {
      throw new ApiError(404, "Guide not found");
    }

    return res.status(200).json(
      new ApiResponse(200, guide, "Guide fetched successfully")
    );
  }
);

// ==================== BROWSE GUIDES ====================

// Get all guides with filters
export const getGuides = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      city,
      specialty,
      minPrice,
      maxPrice,
      minRating,
      sortBy = "rating",
      page = 1,
      limit = 20,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query: any = { isActive: true, isVerified: true };

    if (city) {
      query.city = { $regex: new RegExp(city as string, "i") };
    }

    if (specialty) {
      query.specialties = { $in: [specialty] };
    }

    if (minPrice || maxPrice) {
      query.pricePerHour = {};
      if (minPrice) query.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) query.pricePerHour.$lte = Number(maxPrice);
    }

    if (minRating) {
      query.averageRating = { $gte: Number(minRating) };
    }

    // Build sort
    let sortOption: any = { averageRating: -1 }; // Default: top-rated first
    if (sortBy === "price_low") sortOption = { pricePerHour: 1 };
    if (sortBy === "price_high") sortOption = { pricePerHour: -1 };
    if (sortBy === "experience") sortOption = { experience: -1 };
    if (sortBy === "reviews") sortOption = { totalReviews: -1 };

    const totalCount = await Guide.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    const guides = await Guide.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .populate("user", "name email profileImage nationality")
      .lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          guides,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
            hasMore: pageNum < totalPages,
          },
        },
        "Guides fetched successfully"
      )
    );
  }
);

// Get nearby guides
export const getNearbyGuides = asyncHandler(
  async (req: Request, res: Response) => {
    const { lat, lng, radius = 50000, specialty, page = 1, limit = 20 } = req.query;

    if (!lat || !lng) {
      throw new ApiError(400, "Latitude and longitude are required");
    }

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query: any = {
      isActive: true,
      isVerified: true,
      cityCoordinates: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(radius),
        },
      },
    };

    if (specialty) {
      query.specialties = { $in: [specialty] };
    }

    const guides = await Guide.find(query)
      .skip(skip)
      .limit(limitNum)
      .populate("user", "name email profileImage nationality")
      .lean();

    return res.status(200).json(
      new ApiResponse(200, { guides }, "Nearby guides fetched successfully")
    );
  }
);

// ==================== BOOKING MANAGEMENT ====================

// Create booking
export const createBooking = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const travelerId = req.user._id;
    const { guideId, date, startTime, endTime, duration, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(guideId)) {
      throw new ApiError(400, "Invalid guide ID");
    }

    const guide = await Guide.findById(guideId);
    if (!guide) {
      throw new ApiError(404, "Guide not found");
    }

    if (!guide.isActive) {
      throw new ApiError(400, "Guide is not available for bookings");
    }

    // Check if traveler is trying to book themselves
    if (guide.user.toString() === travelerId.toString()) {
      throw new ApiError(400, "You cannot book yourself as a guide");
    }

    // Check for overlapping bookings
    const bookingDate = new Date(date);
    const existingBooking = await GuideBooking.findOne({
      guide: guideId,
      date: {
        $gte: new Date(bookingDate.setHours(0, 0, 0, 0)),
        $lt: new Date(bookingDate.setHours(23, 59, 59, 999)),
      },
      status: { $in: ["pending", "confirmed"] },
      $or: [
        { startTime: { $lte: startTime }, endTime: { $gt: startTime } },
        { startTime: { $lt: endTime }, endTime: { $gte: endTime } },
        { startTime: { $gte: startTime }, endTime: { $lte: endTime } },
      ],
    });

    if (existingBooking) {
      throw new ApiError(400, "This time slot is already booked");
    }

    const totalPrice = guide.pricePerHour * Number(duration);

    const booking = await GuideBooking.create({
      guide: guideId,
      traveler: travelerId,
      date: new Date(date),
      startTime,
      endTime,
      duration: Number(duration),
      totalPrice,
      notes,
    });

    const populatedBooking = await GuideBooking.findById(booking._id)
      .populate({
        path: "guide",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("traveler", "name email profileImage mobile");

    return res.status(201).json(
      new ApiResponse(201, populatedBooking, "Booking created successfully")
    );
  }
);

// Accept booking (by guide) - awaiting payment from traveler
export const confirmBooking = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const { id } = req.params;

    const booking = await GuideBooking.findById(id).populate("guide");
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const guide = booking.guide as any;
    if (guide.user.toString() !== userId.toString()) {
      throw new ApiError(403, "Not authorized to accept this booking");
    }

    if (booking.status !== "pending") {
      throw new ApiError(400, "Only pending bookings can be accepted");
    }

    booking.status = "accepted";
    await booking.save();

    const populatedBooking = await GuideBooking.findById(id)
      .populate({
        path: "guide",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("traveler", "name email profileImage mobile");

    return res.status(200).json(
      new ApiResponse(200, populatedBooking, "Booking accepted. Awaiting payment from traveler.")
    );
  }
);

// Cancel booking
export const cancelBooking = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await GuideBooking.findById(id).populate("guide");
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const guide = booking.guide as any;
    const isGuide = guide.user.toString() === userId.toString();
    const isTraveler = booking.traveler.toString() === userId.toString();

    if (!isGuide && !isTraveler) {
      throw new ApiError(403, "Not authorized to cancel this booking");
    }

    if (booking.status === "completed" || booking.status === "cancelled") {
      throw new ApiError(400, "Cannot cancel this booking");
    }

    booking.status = "cancelled";
    booking.cancellationReason = reason;
    booking.cancelledBy = userId;
    await booking.save();

    return res.status(200).json(
      new ApiResponse(200, booking, "Booking cancelled successfully")
    );
  }
);

// Complete booking (by guide)
export const completeBooking = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const { id } = req.params;

    const booking = await GuideBooking.findById(id).populate("guide");
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    const guide = booking.guide as any;
    if (guide.user.toString() !== userId.toString()) {
      throw new ApiError(403, "Not authorized to complete this booking");
    }

    if (booking.status !== "confirmed") {
      throw new ApiError(400, "Only confirmed bookings can be marked complete");
    }

    booking.status = "completed";
    booking.paymentStatus = "paid";
    await booking.save();

    // Increment guide's total bookings
    await Guide.findByIdAndUpdate(guide._id, { $inc: { totalBookings: 1 } });

    return res.status(200).json(
      new ApiResponse(200, booking, "Booking completed successfully")
    );
  }
);

// Get my bookings as traveler
export const getMyBookingsAsTraveler = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const { status } = req.query;

    const query: any = { traveler: userId };
    if (status) {
      query.status = status;
    }

    const bookings = await GuideBooking.find(query)
      .sort({ date: -1 })
      .populate({
        path: "guide",
        populate: { path: "user", select: "name email profileImage" },
      })
      .lean();

    return res.status(200).json(
      new ApiResponse(200, bookings, "Bookings fetched successfully")
    );
  }
);

// Get my bookings as guide
export const getMyBookingsAsGuide = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const guide = await Guide.findOne({ user: userId });

    if (!guide) {
      throw new ApiError(404, "Guide profile not found");
    }

    const { status } = req.query;

    const query: any = { guide: guide._id };
    if (status) {
      query.status = status;
    }

    const bookings = await GuideBooking.find(query)
      .sort({ date: -1 })
      .populate("traveler", "name email profileImage mobile")
      .lean();

    return res.status(200).json(
      new ApiResponse(200, bookings, "Guide bookings fetched successfully")
    );
  }
);

// ==================== REVIEWS ====================

// Create review
export const createReview = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const reviewerId = req.user._id;
    const { id } = req.params; // guide id
    const { bookingId, rating, comment } = req.body;

    // Validate booking
    const booking = await GuideBooking.findById(bookingId);
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.traveler.toString() !== reviewerId.toString()) {
      throw new ApiError(403, "You can only review your own bookings");
    }

    if (booking.status !== "completed") {
      throw new ApiError(400, "Can only review completed bookings");
    }

    // Check if review already exists
    const existingReview = await GuideReview.findOne({ booking: bookingId });
    if (existingReview) {
      throw new ApiError(400, "You have already reviewed this booking");
    }

    const review = await GuideReview.create({
      guide: id,
      booking: bookingId,
      reviewer: reviewerId,
      rating: Number(rating),
      comment,
    });

    // Update guide's average rating
    const allReviews = await GuideReview.find({ guide: id });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRating / allReviews.length;

    await Guide.findByIdAndUpdate(id, {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: allReviews.length,
    });

    const populatedReview = await GuideReview.findById(review._id).populate(
      "reviewer",
      "name profileImage"
    );

    return res.status(201).json(
      new ApiResponse(201, populatedReview, "Review created successfully")
    );
  }
);

// Get guide reviews
export const getGuideReviews = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, parseInt(limit as string) || 10);
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await GuideReview.countDocuments({ guide: id });
    const totalPages = Math.ceil(totalCount / limitNum);

    const reviews = await GuideReview.find({ guide: id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("reviewer", "name profileImage")
      .lean();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          reviews,
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalCount,
            totalPages,
            hasMore: pageNum < totalPages,
          },
        },
        "Reviews fetched successfully"
      )
    );
  }
);

// ==================== GUIDE BOOKING PAYMENT ====================

// Cashfree config helper
const getCashfreeConfig = () => {
  const CF_APP_ID = process.env.CASHFREE_APP_ID;
  const CF_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
  const CF_ENV = process.env.CASHFREE_ENV || "TEST";
  const BASE_URL = CF_ENV === "PROD"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";
  return { CF_APP_ID, CF_SECRET_KEY, BASE_URL };
};

// Create payment order for guide booking
export const createGuideBookingPayment = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const { id } = req.params; // booking id

    const booking = await GuideBooking.findById(id)
      .populate({
        path: "guide",
        populate: { path: "user", select: "name email profileImage" },
      });

    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.traveler.toString() !== userId.toString()) {
      throw new ApiError(403, "Not authorized to pay for this booking");
    }

    if (booking.status !== "accepted") {
      throw new ApiError(400, "Payment can only be made for accepted bookings");
    }

    if (booking.paymentStatus === "paid") {
      throw new ApiError(400, "Booking is already paid");
    }

    const { CF_APP_ID, CF_SECRET_KEY, BASE_URL } = getCashfreeConfig();

    if (!CF_APP_ID || !CF_SECRET_KEY) {
      throw new ApiError(500, "Payment configuration missing");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const orderId = `GUIDE_${Date.now()}_${userId.toString().slice(-4)}`;

    // Dynamic import for axios
    const axios = (await import("axios")).default;

    const payload = {
      order_id: orderId,
      order_amount: booking.totalPrice,
      order_currency: "INR",
      customer_details: {
        customer_id: userId.toString(),
        customer_email: user.email || "user@travelbuddy.com",
        customer_phone: user.mobile || "9999999999",
        customer_name: user.name || "TravelBuddy User",
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL}/guide-booking-payment-status?order_id=${orderId}&booking_id=${id}`,
      },
      order_tags: {
        bookingId: id,
        type: "guide_booking",
      },
    };

    const response = await axios.post(`${BASE_URL}/orders`, payload, {
      headers: {
        "x-client-id": CF_APP_ID,
        "x-client-secret": CF_SECRET_KEY,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
      },
    });

    return res.status(200).json(
      new ApiResponse(200, {
        ...response.data,
        bookingId: id,
        amount: booking.totalPrice,
      }, "Payment order created successfully")
    );
  }
);

// Verify payment and confirm booking
export const verifyGuideBookingPayment = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id;
    const { id } = req.params; // booking id
    const { orderId } = req.body;

    if (!orderId) {
      throw new ApiError(400, "Order ID is required");
    }

    const booking = await GuideBooking.findById(id).populate("guide");
    if (!booking) {
      throw new ApiError(404, "Booking not found");
    }

    if (booking.traveler.toString() !== userId.toString()) {
      throw new ApiError(403, "Not authorized to verify payment for this booking");
    }

    if (booking.status !== "accepted") {
      throw new ApiError(400, "Booking is not in accepted state");
    }

    const { CF_APP_ID, CF_SECRET_KEY, BASE_URL } = getCashfreeConfig();

    // Dynamic import for axios
    const axios = (await import("axios")).default;

    const response = await axios.get(`${BASE_URL}/orders/${orderId}`, {
      headers: {
        "x-client-id": CF_APP_ID,
        "x-client-secret": CF_SECRET_KEY,
        "x-api-version": "2023-08-01",
      },
    });

    const orderData = response.data;
    const orderStatus = orderData.order_status;

    if (orderStatus === "PAID") {
      booking.status = "confirmed";
      booking.paymentStatus = "paid";
      await booking.save();

      const populatedBooking = await GuideBooking.findById(id)
        .populate({
          path: "guide",
          populate: { path: "user", select: "name email profileImage" },
        })
        .populate("traveler", "name email profileImage mobile");

      return res.status(200).json(
        new ApiResponse(200, {
          status: "PAID",
          booking: populatedBooking,
        }, "Payment verified and booking confirmed")
      );
    } else {
      return res.status(400).json(
        new ApiResponse(400, {
          status: orderStatus,
          booking,
        }, "Payment not completed")
      );
    }
  }
);
