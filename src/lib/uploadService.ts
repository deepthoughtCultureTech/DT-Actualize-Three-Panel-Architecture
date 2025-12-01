import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";

function uploadBuffer(
  buffer: Buffer,
  options: Record<string, any>
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    console.log("🔍 Starting upload with options:", options);

    // ✅ Force API URL
    const uploadOptions = {
      ...options,
      api_proxy: undefined, // Clear any proxy
    };

    try {
      const stream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error("❌ Upload callback error:", {
              message: error.message,
              http_code: error.http_code,
              // Try to get raw response
              toString: error.toString(),
            });
            return reject(error);
          }

          if (!result) {
            console.error("❌ No result returned");
            return reject(new Error("No result from Cloudinary"));
          }

          console.log("✅ Upload success:", result.secure_url);
          resolve(result as UploadApiResponse);
        }
      );

      stream.on("error", (streamError) => {
        console.error("❌ Stream error event:", streamError);
        reject(streamError);
      });

      console.log("📝 Writing buffer...");
      stream.end(buffer);
      console.log("✅ Buffer written");
    } catch (syncError) {
      console.error("❌ Sync error creating stream:", syncError);
      reject(syncError);
    }
  });
}

export async function uploadFile(
  buffer: Buffer,
  filename?: string
): Promise<UploadApiResponse> {
  console.log("📤 uploadFile called");

  return uploadBuffer(buffer, {
    folder: "myapp/files",
    resource_type: "raw", // ✅ Use "raw" instead of "auto"
    use_filename: !!filename,
    unique_filename: !filename,
    public_id: filename ? filename.split(".")[0] : undefined,
  });
}

export async function uploadImage(buffer: Buffer): Promise<UploadApiResponse> {
  console.log("📸 uploadImage called");
  return uploadBuffer(buffer, {
    folder: "myapp/images",
    resource_type: "image",
  });
}

export async function uploadAudio(buffer: Buffer): Promise<UploadApiResponse> {
  console.log("🎵 uploadAudio called");
  return uploadBuffer(buffer, {
    folder: "myapp/audio",
    resource_type: "video",
    format: "mp3",
  });
}

export async function deleteFile(publicId: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.destroy(publicId);
}
