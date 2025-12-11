import { v2 as cloudinary, UploadApiResponse, UploadApiOptions } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

interface DeleteResponse {
  success: boolean;
  result?: string;
  publicId?: string;
  url?: string;
  error?: string;
}

const deleteFromCloudinaryByUrl = async (
  cloudinaryUrl: string,
  resourceType: "image" | "video" | "raw" | "auto" = "image"
): Promise<DeleteResponse> => {
  try {
    if (!cloudinaryUrl) {
      console.error("No Cloudinary URL provided");
      return { success: false, error: "No URL provided" };
    }

    // -----------------------
    // Extract public ID
    // -----------------------
    const extractPublicIdFromUrl = (url: string): string | null => {
      try {
        // Split URL
        const parts = url.split("/");

        // Find the "upload" segment
        const uploadIndex = parts.indexOf("upload");
        if (uploadIndex === -1) throw new Error("Invalid Cloudinary URL format");

        // Get path after "upload"
        let publicIdParts = parts.slice(uploadIndex + 1);

        // Remove version (e.g., v12345678)
        if (/^v\d+$/.test(publicIdParts[0])) {
          publicIdParts = publicIdParts.slice(1);
        }

        // Join + remove extension
        return publicIdParts.join("/").replace(/\.[^/.]+$/, "");
      } catch (err) {
        console.error("Error extracting public ID:", err);
        return null;
      }
    };

    const publicId = extractPublicIdFromUrl(cloudinaryUrl);

    if (!publicId) {
      return { success: false, error: "Invalid URL format" };
    }

    console.log("Deleting from Cloudinary →", publicId);

    // -----------------------
    // Delete from Cloudinary
    // -----------------------
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    if (response.result === "ok") {
      return {
        success: true,
        result: response.result,
        publicId,
        url: cloudinaryUrl,
      };
    }

    return {
      success: false,
      result: response.result,
      publicId,
      url: cloudinaryUrl,
    };
  } catch (error: any) {
    console.error("Error deleting file from Cloudinary:", error);
    return {
      success: false,
      error: error.message,
      url: cloudinaryUrl,
    };
  }
};

export default deleteFromCloudinaryByUrl;
