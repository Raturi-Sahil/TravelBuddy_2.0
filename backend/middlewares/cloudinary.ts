import { UploadApiResponse,v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

interface UploadOptions {
  folder?: string;
  width?: number;
  height?: number;
  crop?: string;
  gravity?: string;
}

const uploadOnCloudinary = async (
  localFilePath: string,
  options?: UploadOptions
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) {
      console.error("No file path provided");
      return null;
    }

    // Default options for profile pictures
    const defaultOptions = {
      folder: "travelBuddy",
      resource_type: "auto" as const,
      width: 250,
      height: 250,
      gravity: "faces",
      crop: "fill",
    };

    // Merge with custom options
    const uploadOptions = {
      ...defaultOptions,
      ...options,
    };

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, uploadOptions);

    // Remove local temp file
    await fs.rm(localFilePath);

    return response;
  } catch (error) {
    console.error("Error uploading file:", error);

    // Cleanup local file if upload fails
    try {
      await fs.stat(localFilePath);
      await fs.rm(localFilePath);
      console.log("Local file removed after error:", localFilePath);
    } catch (unlinkError) {
      console.error("Error removing local file:", unlinkError);
    }

    return null;
  }
};

// Dedicated function for cover image uploads with appropriate dimensions
export const uploadCoverImage = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  return uploadOnCloudinary(localFilePath, {
    folder: "travelBuddy/covers",
    width: 1200,
    height: 400,
    crop: "fill",
    gravity: "auto",
  });
};

// Dedicated function for profile image uploads
export const uploadProfileImage = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  return uploadOnCloudinary(localFilePath, {
    folder: "travelBuddy/profiles",
    width: 250,
    height: 250,
    crop: "fill",
    gravity: "faces",
  });
};

export default uploadOnCloudinary;

