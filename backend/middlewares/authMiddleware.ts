import { ClerkExpressRequireAuth } from "@clerk/clerk-sdk-node";
import { NextFunction,Request, Response } from "express";

import { User } from "../models/userModel";
import asyncHandler from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      user?: any;
      auth?: {
        userId: string;
        sessionId: string;
        getToken: (options?: { template?: string }) => Promise<string | null>;
        claims?: any;
      };
    }
  }
}

// Custom error handler for Clerk auth failures
const handleClerkError = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err?.status === 401 || err?.statusCode === 401 || err.message === 'Unauthenticated') {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - Invalid or missing token",
      redirect: "/sign-in"
    });
  }
  next(err);
};

// Middleware to check if user exists in MongoDB (after Clerk verification)
const checkUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.auth?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized - No Clerk User ID",
      redirect: "/sign-in"
    });
  }

  const user = await User.findOne({ clerk_id: userId });

  if (!user) {
    return res.status(403).json({
      success: false,
      message: "Profile incomplete - Please complete registration",
      redirect: "/complete-registration"
    });
  }

  req.user = user;
  next();
});

// verifyClerk: Only verifies Clerk token, doesn't require MongoDB profile
// Use for routes like /register where user needs auth but doesn't have a profile yet
export const verifyClerk = [
  ClerkExpressRequireAuth(),
  handleClerkError
] as any;

// requireProfile: Full auth - verifies Clerk token AND requires MongoDB profile
// Use for protected routes that need a complete user profile
export const requireProfile = [
  ClerkExpressRequireAuth(),
  handleClerkError,
  checkUserProfile
] as any;

// Alias for backward compatibility
export const verifyJWT = requireProfile;
