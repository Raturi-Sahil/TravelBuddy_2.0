import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import fs from "fs/promises";

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

const uploadOnCloudinary = async (
  localFilePath: string
): Promise<UploadApiResponse | null> => {
  try {
    if (!localFilePath) {
      console.error("No file path provided");
      return null;
    }

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "travelBuddy",
      resource_type: "auto",
      width: 250,
      height: 250,
      gravity: "faces",
      crop: "fill",
    });

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

export default uploadOnCloudinary;
