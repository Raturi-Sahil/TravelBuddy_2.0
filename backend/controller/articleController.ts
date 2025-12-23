import { Request, Response } from "express";
import mongoose from "mongoose";

import uploadOnCloudinary from "../middlewares/cloudinary";
import deleteFromCloudinaryByUrl from "../middlewares/deleteCloudinary";
import { Article } from "../models/articleModel";
import ApiError from "../utils/apiError";
import ApiResponse from "../utils/apiResponse";
import asyncHandler from "../utils/asyncHandler";

// Create a new article
export const createArticle = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    console.log("createArticle: Request received");

    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const user = req.user;
    const userId = user._id;

    const { title, content, excerpt, category, tags, visibility, status } =
      req.body;

    if (!title || !content) {
      throw new ApiError(400, "Title and content are required");
    }

    // Handle file uploads (cover image and other images)
    let files: Express.Multer.File[] = [];
    if (Array.isArray(req.files)) {
      files = req.files;
    } else if (req.files && typeof req.files === "object") {
      files = [...((req.files as any).images || [])];
    }

    console.log(`createArticle: Processing ${files.length} files`);

    const uploadedImageUrls: string[] = [];

    try {
      for (const file of files) {
        console.log(`createArticle: Uploading file ${file.originalname}`);
        const result = await uploadOnCloudinary(file.path);
        if (!result) {
          throw new ApiError(500, "Media upload failed");
        }
        uploadedImageUrls.push(result.secure_url);
      }
    } catch (err) {
      console.error("createArticle: Upload error", err);
      // Cleanup uploaded files
      for (const url of uploadedImageUrls) {
        await deleteFromCloudinaryByUrl(url);
      }
      throw err;
    }

    // Parse tags if it's a string
    let parsedTags;
    if (tags) {
      parsedTags = typeof tags === "string" ? JSON.parse(tags) : tags;
    }

    try {
      const article = await Article.create({
        userId: userId.toString(),
        userName: user.name,
        userAvatar: user.profileImage || "",
        title,
        content,
        excerpt: excerpt || content.substring(0, 250) + "...",
        coverImage: uploadedImageUrls[0] || "",
        images: uploadedImageUrls,
        category: category || "Travel Tips",
        tags: parsedTags,
        visibility: visibility || "Public",
        status: status || "Draft",
        likes: [],
        likesCount: 0,
        comments: [],
        commentsCount: 0,
        shares: 0,
        views: 0,
      });

      if (!article) {
        throw new ApiError(500, "Failed to create article");
      }

      console.log("createArticle: Created article", article._id);

      return res
        .status(201)
        .json(new ApiResponse(201, article, "Article created successfully"));
    } catch (err) {
      console.error("createArticle: DB Error", err);
      // Cleanup uploaded files if DB fails
      for (const url of uploadedImageUrls) {
        await deleteFromCloudinaryByUrl(url);
      }
      throw err;
    }
  }
);

// Get all articles (feed) with pagination
export const getArticles = asyncHandler(
  async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const visibility = req.query.visibility as string;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const userId = req.query.userId as string;

    const filter: any = {};

    // Filter by visibility
    if (visibility) {
      filter.visibility = visibility;
    } else {
      // Default to public articles only
      filter.visibility = "Public";
    }

    // Filter by category
    if (category) {
      filter.category = category;
    }

    // Filter by status
    if (status) {
      filter.status = status;
    } else {
      // Default to published articles only
      filter.status = "Published";
    }

    // Filter by user
    if (userId) {
      filter.userId = userId;
    }

    const articles = await Article.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalArticles = await Article.countDocuments(filter);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          articles,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalArticles / limit),
            totalArticles,
            hasMore: page * limit < totalArticles,
          },
        },
        "Articles fetched successfully"
      )
    );
  }
);

// Get user's own articles
export const getMyArticles = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const articles = await Article.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalArticles = await Article.countDocuments({ userId });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          articles,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalArticles / limit),
            totalArticles,
            hasMore: page * limit < totalArticles,
          },
        },
        "Your articles fetched successfully"
      )
    );
  }
);

// Get a single article by ID
export const getArticleById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid article id");
    }

    const article = await Article.findById(id).lean();

    if (!article) {
      throw new ApiError(404, "Article not found");
    }

    // Increment view count
    await Article.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return res
      .status(200)
      .json(new ApiResponse(200, article, "Article fetched successfully"));
  }
);

// Update an article
export const updateArticle = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid article id");
    }

    const article = await Article.findById(id);

    if (!article) {
      throw new ApiError(404, "Article not found");
    }

    if (article.userId !== userId) {
      throw new ApiError(403, "You are not allowed to update this article");
    }

    const { title, content, excerpt, category, tags, visibility, status } =
      req.body;

    const updateData: any = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (category !== undefined) updateData.category = category;
    if (visibility !== undefined) updateData.visibility = visibility;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined)
      updateData.tags = typeof tags === "string" ? JSON.parse(tags) : tags;

    updateData.updatedAt = new Date();

    const updatedArticle = await Article.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean();

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedArticle, "Article updated successfully")
      );
  }
);

// Delete an article
export const deleteArticle = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid article id");
    }

    const article = await Article.findById(id);

    if (!article) {
      throw new ApiError(404, "Article not found");
    }

    if (article.userId !== userId) {
      throw new ApiError(403, "You are not allowed to delete this article");
    }

    // Delete associated media from Cloudinary
    const allMedia = [...article.images].filter((url) => url);
    if (article.coverImage) {
      allMedia.push(article.coverImage);
    }
    for (const url of allMedia) {
      try {
        await deleteFromCloudinaryByUrl(url);
      } catch (err) {
        console.error(`Failed to delete media: ${url}`, err);
      }
    }

    await Article.findByIdAndDelete(id);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Article deleted successfully"));
  }
);

// Like/Unlike an article
export const toggleLike = asyncHandler(
  async (req: Request & { user?: any }, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, "Unauthorized");
    }

    const userId = req.user._id.toString();
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid article id");
    }

    const article = await Article.findById(id);

    if (!article) {
      throw new ApiError(404, "Article not found");
    }

    const hasLiked = article.likes.includes(userId);

    let updatedArticle;
    if (hasLiked) {
      // Unlike
      updatedArticle = await Article.findByIdAndUpdate(
        id,
        { $pull: { likes: userId } },
        { new: true }
      ).lean();
    } else {
      // Like
      updatedArticle = await Article.findByIdAndUpdate(
        id,
        { $addToSet: { likes: userId } },
        { new: true }
      ).lean();
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { article: updatedArticle, liked: !hasLiked },
          hasLiked ? "Article unliked successfully" : "Article liked successfully"
        )
      );
  }
);

// Add a comment to an article
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
      throw new ApiError(400, "Invalid article id");
    }

    const article = await Article.findById(id);

    if (!article) {
      throw new ApiError(404, "Article not found");
    }

    const comment = {
      userId,
      userName: user.name,
      userAvatar: user.profileImage || "",
      text: text.trim(),
      createdAt: new Date(),
    };

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { $push: { comments: comment } },
      { new: true }
    ).lean();

    return res
      .status(201)
      .json(
        new ApiResponse(201, updatedArticle, "Comment added successfully")
      );
  }
);

// Delete a comment from an article
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
      throw new ApiError(400, "Invalid article or comment id");
    }

    const article = await Article.findById(id);

    if (!article) {
      throw new ApiError(404, "Article not found");
    }

    const comment = article.comments.find(
      (c: any) => c._id.toString() === commentId
    );

    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }

    // Only the comment author or article owner can delete the comment
    if (comment.userId !== userId && article.userId !== userId) {
      throw new ApiError(403, "You are not allowed to delete this comment");
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    ).lean();

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedArticle, "Comment deleted successfully")
      );
  }
);

// Increment share count
export const incrementShare = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, "Invalid article id");
    }

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { $inc: { shares: 1 } },
      { new: true }
    ).lean();

    if (!updatedArticle) {
      throw new ApiError(404, "Article not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, updatedArticle, "Share count updated"));
  }
);

// Get articles by category
export const getArticlesByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { category } = req.query;

    if (!category) {
      throw new ApiError(400, "Category parameter is required");
    }

    const articles = await Article.find({
      category,
      visibility: "Public",
      status: "Published",
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          articles,
          "Articles by category fetched successfully"
        )
      );
  }
);
