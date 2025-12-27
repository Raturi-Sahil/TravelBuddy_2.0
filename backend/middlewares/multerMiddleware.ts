import { Request } from "express";
import fs from "fs";
import multer, { FileFilterCallback } from "multer";
import path from "path";

import ApiError from "../utils/apiError";

// -----------------------------
// Ensure uploads directory exists
// -----------------------------
const uploadsDir = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// -----------------------------
// Multer Storage
// -----------------------------
const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    cb(null, uploadsDir);
  },

  filename: (req: Request, file: any, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// -----------------------------
// Allowed File Types
// -----------------------------
const allowedMimeTypes: string[] = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp", // Support WebP
  "application/octet-stream", // Sometimes images come as this
];

// -----------------------------
// File Filter
// -----------------------------
const fileFilter = (
  req: Request,
  file: any, // Multer v2 has no exported File type yet
  cb: FileFilterCallback
) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    return cb(null, true);
  }

  return cb(new ApiError(400, "Invalid file type"));
};

// -----------------------------
// Multer Upload
// -----------------------------
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter,
});

export default upload;
