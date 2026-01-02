import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { generateAdminToken } from "../middlewares/adminMiddleware";
import { Activity } from "../models/activityModel";
import { Article } from "../models/articleModel";
import { Guide, GuideBooking } from "../models/guideModel";
import { Post } from "../models/postModel";
import { User } from "../models/userModel";
import asyncHandler from "../utils/asyncHandler";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@travelbuddy.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

// ==================== AUTH ====================

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: "Invalid admin credentials",
    });
  }

  const token = generateAdminToken(email);

  res.status(200).json({
    success: true,
    message: "Admin login successful",
    data: {
      token,
      email,
    },
  });
});

export const verifyAdminToken = asyncHandler(async (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Token is valid",
    data: {
      email: req.admin?.email,
    },
  });
});

// ==================== DASHBOARD ====================

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalUsers,
    totalPosts,
    totalActivities,
    totalGuides,
    totalArticles,
    totalBookings,
    recentUsers,
    usersByMonth,
  ] = await Promise.all([
    User.countDocuments(),
    Post.countDocuments(),
    Activity.countDocuments(),
    Guide.countDocuments(),
    Article.countDocuments(),
    GuideBooking.countDocuments(),
    User.find().sort({ createdAt: -1 }).limit(5).select("name email profileImage createdAt"),
    User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 },
    ]),
  ]);

  // Get content distribution
  const contentDistribution = [
    { name: "Posts", value: totalPosts },
    { name: "Articles", value: totalArticles },
    { name: "Activities", value: totalActivities },
  ];

  // Format user growth data
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const userGrowth = usersByMonth.reverse().map((item: any) => ({
    month: months[item._id.month - 1],
    users: item.count,
  }));

  res.status(200).json({
    success: true,
    data: {
      stats: {
        totalUsers,
        totalPosts,
        totalActivities,
        totalGuides,
        totalArticles,
        totalBookings,
      },
      recentUsers,
      userGrowth,
      contentDistribution,
    },
  });
});

// ==================== USER MANAGEMENT ====================

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = req.query.search as string;
  const skip = (page - 1) * limit;

  let query: any = {};

  if (search) {
    query = {
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    };
  }

  const [users, total] = await Promise.all([
    User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-friends -friendRequests -sentFriendRequests -JoinActivity"),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findById(id)
    .populate("friends", "name email profileImage")
    .populate("JoinActivity");

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = req.body;

  // Prevent updating sensitive fields
  delete updates.clerk_id;
  delete updates.password;

  const user = await User.findByIdAndUpdate(id, updates, { new: true });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "User updated successfully",
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Also delete user's posts, activities, etc.
  await Promise.all([
    Post.deleteMany({ userId: user.clerk_id }),
    Activity.deleteMany({ createdBy: id }),
    Article.deleteMany({ userId: user.clerk_id }),
  ]);

  res.status(200).json({
    success: true,
    message: "User and associated content deleted successfully",
  });
});

// ==================== POST MODERATION ====================

export const getPosts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const post = await Post.findByIdAndDelete(id);

  if (!post) {
    return res.status(404).json({
      success: false,
      message: "Post not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

// ==================== ARTICLE MANAGEMENT ====================

export const getArticles = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [articles, total] = await Promise.all([
    Article.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Article.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const deleteArticle = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const article = await Article.findByIdAndDelete(id);

  if (!article) {
    return res.status(404).json({
      success: false,
      message: "Article not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Article deleted successfully",
  });
});

// ==================== ACTIVITY MANAGEMENT ====================

export const getActivities = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [activities, total] = await Promise.all([
    Activity.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email profileImage")
      .populate("participants", "name profileImage"),
    Activity.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      activities,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const cancelActivity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const activity = await Activity.findByIdAndUpdate(
    id,
    {
      isCancelled: true,
      cancelledAt: new Date(),
      cancellationReason: reason || "Cancelled by admin",
    },
    { new: true }
  );

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Activity cancelled successfully",
    data: activity,
  });
});

export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const activity = await Activity.findByIdAndDelete(id);

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Activity deleted successfully",
  });
});

// ==================== GUIDE MANAGEMENT ====================

export const getGuides = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const [guides, total] = await Promise.all([
    Guide.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "name email profileImage"),
    Guide.countDocuments(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      guides,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

export const verifyGuide = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isVerified } = req.body;

  const guide = await Guide.findByIdAndUpdate(
    id,
    { isVerified: isVerified ?? true },
    { new: true }
  ).populate("user", "name email profileImage");

  if (!guide) {
    return res.status(404).json({
      success: false,
      message: "Guide not found",
    });
  }

  res.status(200).json({
    success: true,
    message: `Guide ${isVerified ? "verified" : "unverified"} successfully`,
    data: guide,
  });
});

export const toggleGuideStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const guide = await Guide.findById(id);

  if (!guide) {
    return res.status(404).json({
      success: false,
      message: "Guide not found",
    });
  }

  guide.isActive = !guide.isActive;
  await guide.save();

  res.status(200).json({
    success: true,
    message: `Guide ${guide.isActive ? "activated" : "deactivated"} successfully`,
    data: guide,
  });
});

// ==================== GUIDE BOOKINGS ====================

export const getGuideBookings = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const status = req.query.status as string;
  const skip = (page - 1) * limit;

  let query: any = {};
  if (status) {
    query.status = status;
  }

  const [bookings, total] = await Promise.all([
    GuideBooking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "guide",
        populate: { path: "user", select: "name email profileImage" },
      })
      .populate("traveler", "name email profileImage"),
    GuideBooking.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    data: {
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
});
