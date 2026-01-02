import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      admin?: {
        email: string;
        isAdmin: boolean;
      };
    }
  }
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "admin-secret-key-change-in-production";

export const verifyAdmin = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No admin token provided.",
      });
    }

    const token = authHeader.split(" ")[1];
    
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as {
      email: string;
      isAdmin: boolean;
    };

    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Not an admin.",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token.",
    });
  }
};

export const generateAdminToken = (email: string): string => {
  return jwt.sign(
    { email, isAdmin: true },
    ADMIN_JWT_SECRET,
    { expiresIn: "7d" }
  );
};
