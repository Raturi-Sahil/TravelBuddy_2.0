import { NextFunction,Request, Response } from "express";

import ApiError from "../utils/apiError";

import { ZodError } from "zod";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error for server-side debugging
  console.error("Error caught in middleware:", err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
     return res.status(400).json({
         success: false,
         message: "Validation Error",
         errors: err.issues.map(e => e.message),
         stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
     });
  }

  // Handle generic errors
  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

export default errorMiddleware;
