import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";

function uploadBuffer(
  buffer: Buffer,
  options: Record<string, any>
): Promise<UploadApiResponse> {
  return new Promise((resolve, reject) => {
    console.log("🔍 Starting upload with options:", options);

    try {
      const stream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            // ✅ Cast error to any to access internal properties
            const err = error as any;

            const errorDetails = {
              message: error.message,
              http_code: error.http_code,
              name: error.name,
              error: err.error,
              response: err.response,
              body: err.body,
              text: err.text,
              html: err.html,
              full: JSON.stringify(error, null, 2),
            };

            console.error("❌ Full error object:", errorDetails);

            // Try to parse the message for HTML content
            if (error.message && error.message.includes("<!DOCTYPE")) {
              const htmlMatch = error.message.match(/<!DOCTYPE[\s\S]*?>/);
              if (htmlMatch) {
                console.error(
                  "❌ HTML Error Page:",
                  htmlMatch[0].substring(0, 500)
                );
              }
            }

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

      stream.on("error", (streamError: any) => {
        console.error("❌ Stream error:", {
          message: streamError.message,
          stack: streamError.stack,
        });
        reject(streamError);
      });

      console.log("📝 Writing buffer...");
      stream.end(buffer);
      console.log("✅ Buffer written");
    } catch (syncError: any) {
      console.error("❌ Sync error:", {
        message: syncError.message,
        stack: syncError.stack,
      });
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
    resource_type: "raw",
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
  });
}

export async function deleteFile(publicId: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.destroy(publicId);
}
