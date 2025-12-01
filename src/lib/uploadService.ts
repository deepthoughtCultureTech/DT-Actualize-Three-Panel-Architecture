import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";

function uploadBuffer(
  buffer: Buffer,
  options: Record<string, any>
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    // ✅ Log Cloudinary version and config
    console.log("🔍 Cloudinary SDK version:", (cloudinary as any).version);
    console.log("🔍 Config loaded:", {
      cloud_name: cloudinary.config().cloud_name,
      api_key: cloudinary.config().api_key,
      secure: cloudinary.config().secure,
    });

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) {
          // ✅ Log FULL error object
          console.error("❌ Cloudinary stream error (full):", {
            message: error.message,
            name: error.name,
            http_code: error.http_code,
            error: error.error,
            // @ts-ignore
            response: error.response,
            // @ts-ignore
            body: error.body,
          });
          return reject(error);
        }

        console.log("✅ Stream success");
        resolve(result as UploadApiResponse);
      }
    );

    // ✅ Catch stream errors
    stream.on("error", (streamError) => {
      console.error("❌ Stream event error:", streamError);
      reject(streamError);
    });

    // ✅ Log when buffer is written
    console.log("📝 Writing buffer to stream...");
    stream.end(buffer);
    console.log("✅ Buffer written to stream");
  });
}

export async function uploadFile(
  buffer: Buffer,
  filename?: string
): Promise<UploadApiResponse> {
  console.log("📤 uploadFile called");

  try {
    const result = await uploadBuffer(buffer, {
      folder: "myapp/files",
      resource_type: "raw",
      use_filename: !!filename,
      unique_filename: !filename,
      access_mode: "public",
    });

    console.log("✅ uploadFile complete");
    return result;
  } catch (error: any) {
    console.error("❌ uploadFile error:", error);
    throw error;
  }
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
