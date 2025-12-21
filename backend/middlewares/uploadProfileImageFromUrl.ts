import axios from "axios";
import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";

import uploadOnCloudinary from "./cloudinary";

/**
 * Downloads an image from a URL and uploads it to Cloudinary
 * Used for uploading Clerk profile images to Cloudinary at registration
 * @param imageUrl - The URL of the image to download (e.g., Clerk profile image URL)
 * @returns The Cloudinary secure URL or null if upload fails
 */
export async function uploadProfileImageFromUrl(imageUrl: string): Promise<string | null> {
  if (!imageUrl) {
    return null;
  }

  const tempDir = path.join(process.cwd(), "tmp");
  const tempFilePath = path.join(tempDir, `profile_${uuidv4()}.jpg`);

  try {
    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // Download the image
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 10000, // 10 second timeout
    });

    // Write to temp file
    await fs.writeFile(tempFilePath, response.data);

    // Upload to Cloudinary with profile image options
    const uploadResult = await uploadOnCloudinary(tempFilePath, {
      folder: "travelBuddy/profiles",
      width: 250,
      height: 250,
      crop: "fill",
      gravity: "faces",
    });

    if (uploadResult) {
      return uploadResult.secure_url;
    }

    return null;
  } catch (error) {
    console.error("Error uploading profile image from URL:", error);

    // Clean up temp file if it exists
    try {
      await fs.access(tempFilePath);
      await fs.rm(tempFilePath);
    } catch {
      // File doesn't exist, no cleanup needed
    }

    return null;
  }
}

export default uploadProfileImageFromUrl;
