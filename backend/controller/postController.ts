import { Request, Response } from "express";
import mongoose from "mongoose";

import uploadOnCloudinary from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";
import { Post } from "../models/postModel";
import { User } from "../models/userModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";
import { sendNotification } from "../utils/notificationUtil";

// Create a new post
export const createPost = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    console.log("createPost: Request received");

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = req.user;
    const userId = user._id;

    const { caption, locationName, lat, lng, tags, visibility } = req.body;

    if (!caption) {
      throw new ApiError(400, "Caption is required");
    }

    // Handle file uploads (images/videos)
    let files: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === "object") {
      files = [
        ...((req.files as any).images || []),
        ...((req.files as any).videos || []),
      ];
    }

    // Upload media to Cloudinary
    const uploadedImageUrls: string[] = [];
    const uploadedVideoUrls: string[] = [];

    try {
      for (const file of files) {
        console.log(`createPost: Uploading file ${file.originalname}`);
        const result = await uploadOnCloudinary(file.path);
        if (!result) {
          throw new ApiError(500, "Media upload failed");
        }

        // Determine if it's an image or video based on mimetype
        if (file.mimetype.startsWith("image/")) {
          uploadedImageUrls.push(result.secure_url);
        } else if (file.mimetype.startsWith("video/")) {
          uploadedVideoUrls.push(result.secure_url);
        }
      }
    } catch (err) {
      console.error("createPost: Upload error", err);
      // Cleanup uploaded files
      for (const url of [...uploadedImageUrls, ...uploadedVideoUrls]) {
        await deleteFromCloudinaryByUrl(url);
      }
      throw err;
    }

    // Prepare location object
    let location;
    if (locationName && lat !== undefined && lng !== undefined) {
      location = {
        name: locationName,
        coordinates: [Number(lng), Number(lat)],
      };
    }

    // Parse tags if it's a string
    let parsedTags;
    if (tags) {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    }

    try {
      const post = await Post.create({
        userId: userId.toString(),
        userName: user.name,
        userAvatar: user.profileImage || "",
        userLocation: user.location || "",  // Use the location name field from user
        image: uploadedImageUrls[0] || "",
        images: uploadedImageUrls,
        videos: uploadedVideoUrls,
        caption,
        location,
        tags: parsedTags,
        visibility: visibility || "Public",
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        shares: 0,
      });

      if (!post) {
        throw new ApiError(500, "Failed to create post");
      }

      console.log("createPost: Created post", post._id);

      // Notify User
      await sendNotification({
        recipient: userId as any,
        type: "POST_CREATED",
        message: "Your post has been created successfully",
        link: `/user-posts`,
        relatedId: post._id as any,
      });

      return res
        .status(201)
        .json(new ApiResponse(201, post, "Post created successfully"));
    } catch (err) {
      console.error("createPost: DB Error", err);
      // Cleanup uploaded files if DB fails
      for (const url of [...uploadedImageUrls, ...uploadedVideoUrls]) {
        await deleteFromCloudinaryByUrl(url);
      }
      throw err;
    }
  }
);

// Get all posts (feed) with pagination
export const getPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const visibility = req.query.visibility as string;
    const userId = req.query.userId as string;

    const filter: any = {};

    // Filter by visibility
    if (visibility) {
      filter.visibility = visibility;
    } else {
      // Default to public posts only
      filter.visibility = "Public";
    }

    // Filter by user
    if (userId) {
      filter.userId = userId;
    }

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await Post.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          posts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
            hasMore: page * limit < totalPosts,
          },
        },
        "Posts fetched successfully"
      )
    );
  }
);

// Get MY posts - posts created by the authenticated user
export const getMyPosts = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const filter: any = {
      userId: userId, // Only get posts by this user
    };

    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPosts = await Post.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          posts,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalPosts / limit),
            totalPosts,
            hasMore: page * limit < totalPosts,
          },
        },
        "Your posts fetched successfully"
      )
    );
  }
);

// Get nearby posts based on location
export const getNearbyPosts = asyncHandler(
  async (req: Request, res: Response) => {
    const { lat, lng, maxDistance = 10000 } = req.query; // maxDistance in meters, default 10km

    if (!lat || !lng) {
      throw new ApiError(400, "Latitude and longitude are required");
    }

    const posts = await Post.find({
      "location.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [Number(lng), Number(lat)],
          },
          $maxDistance: Number(maxDistance),
        },
      },
      visibility: "Public",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res
      .status(200)
      .json(new ApiResponse(200, posts, "Nearby posts fetched successfully"));
  }
);

// Get a single post by ID
export const getPostById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid post id");
    }

    const post = await Post.findById(id).lean();

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, post, "Post fetched successfully"));
  }
);

// Update a post
export const updatePost = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid post id");
    }

    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (post.userId !== userId) {
      throw new ApiError(403, "You are not allowed to update this post");
    }

    const { caption, locationName, lat, lng, tags, visibility } = req.body;

    const updateData: any = {};
    if (caption !== undefined) updateData.caption = caption;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (tags !== undefined)
      updateData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;

    if (locationName && lat !== undefined && lng !== undefined) {
      updateData.location = {
        name: locationName,
        coordinates: [Number(lng), Number(lat)],
      };
    }

    updateData.updatedAt = new Date();

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    // Notify User
    await sendNotification({
      recipient: userId as any,
      type: "POST_UPDATED",
      message: "Your post has been updated successfully",
      link: `/user-posts`, // Or specific post link if you have one
      relatedId: id as any,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, updatedPost, "Post updated successfully"));
  }
);

// Delete a post
export const deletePost = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid post id");
    }

    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    if (post.userId !== userId) {
      throw new ApiError(403, "You are not allowed to delete this post");
    }

    // Delete associated media from Cloudinary
    const allMedia = [...post.images, ...post.videos].filter((url) => url);
    for (const url of allMedia) {
      try {
        await deleteFromCloudinaryByUrl(url);
      } catch (err) {
        console.error(`Failed to delete media: ${url}`, err);
      }
    }

    await Post.findByIdAndDelete(id);

    // Notify User
    await sendNotification({
      recipient: userId as any,
      type: "POST_DELETED",
      message: "Your post has been deleted successfully",
      link: `/user-posts`,
      relatedId: id as any, // ID might not be useful if deleted, but keeping ref
    });

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Post deleted successfully"));
  }
);

// Like/Unlike a post
export const toggleLike = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid post id");
    }

    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const hasLiked = post.likes.includes(userId);

    let updatedPost;
    if (hasLiked) {
      // Unlike
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true }
      ).lean();
    } else {
      // Like
      updatedPost = await Post.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userId } },
        { new: true }
      ).lean();

      // Notify Post Owner if liked by someone else
      if (post.userId !== userId) {
        await sendNotification({
          recipient: post.userId as any, // Owner ID
          sender: userId as any,         // Liker ID
          type: "POST_LIKED",
          message: `${req.user.name} liked your post`,
          link: `/user-posts`, // Ideally anchor to specific post
          relatedId: id as any,
        });
      }
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { post: updatedPost, liked: !hasLiked },
          hasLiked ? "Post unliked successfully" : "Post liked successfully"
        )
      );
  }
);

// Add a comment to a post
export const addComment = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = req.user;
    const userId = user._id.toString();
    const { id } = req.params;
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      throw new ApiError(400, "Comment text is required");
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid post id");
    }

    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = {
      userId,
      userName: user.name,
      userAvatar: user.profileImage || "",
      text: text.trim(),
      createdAt: new Date(),
    };

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    ).lean();

    // Notify Post Owner if commented by someone else
    if (post.userId !== userId) {
      await sendNotification({
        recipient: post.userId as any,
        sender: userId as any,
        type: "POST_COMMENTED",
        message: `${user.name} commented on your post`,
        link: `/user-posts`,
        relatedId: id as any,
      });
    }

    return res
      .status(201)
      .json(new ApiResponse(201, updatedPost, "Comment added successfully"));
  }
);

// Delete a comment from a post
export const deleteComment = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const { id, commentId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(commentId)
    ) {
      throw new ApiError(400, "Invalid post or comment id");
    }

    const post = await Post.findById(id);

    if (!post) {
      throw new ApiError(404, "Post not found");
    }

    const comment = post.comments.find(
      (c: any) => c._id.toString() === commentId
    );

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // Only the comment author or post owner can delete the comment
    if (comment.userId !== userId && post.userId !== userId) {
      throw new ApiError(403, "You are not allowed to delete this comment");
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    ).lean();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedPost, "Comment deleted successfully"));
  }
);

// Increment share count
export const incrementShare = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid post id");
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { shares: 1 } },
      { new: true }
    ).lean();

    if (!updatedPost) {
      throw new ApiError(404, "Post not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedPost, "Share count updated"));
  }
);

// Get posts by tags
export const getPostsByTags = asyncHandler(
  async (req: Request, res: Response) => {
    const { tags } = req.query;

    if (!tags) {
      throw new ApiError(400, "Tags parameter is required");
    }

    const tagArray: string[] =
      typeof tags === "string"
        ? tags.split(",").map((t) => t.trim())
        : (tags as string[]);

    const posts = await Post.find({
      tags: { $in: tagArray },
      visibility: "Public",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res
      .status(200)
      .json(
        new ApiResponse(200, posts, "Posts by tags fetched successfully")
      );
  }
);
