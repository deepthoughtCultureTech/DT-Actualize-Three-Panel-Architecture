import { v2 as cloudinary } from "cloudinary";

try {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  console.log("✅ Cloudinary configured:", {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    has_key: !!process.env.CLOUDINARY_API_KEY,
    has_secret: !!process.env.CLOUDINARY_API_SECRET,
  });
} catch (error) {
  console.error("❌ Cloudinary config failed:", error);
}

export default cloudinary;
