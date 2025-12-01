import cloudinary from "./cloudinary";
import { UploadApiResponse } from "cloudinary";

export async function uploadImage(buffer: Buffer): Promise<UploadApiResponse> {
  console.log("Uploading Image");

  // ✅ Convert buffer to base64 data URI
  const base64 = buffer.toString("base64");
  const dataURI = `data:image/png;base64,${base64}`;

  // ✅ Use direct upload (not stream)
  return cloudinary.uploader.upload(dataURI, {
    folder: "myapp/images",
    resource_type: "image",
  });
}

export async function uploadFile(
  buffer: Buffer,
  filename?: string
): Promise<UploadApiResponse> {
  console.log("Uploading File");

  // ✅ Convert buffer to base64 data URI
  const base64 = buffer.toString("base64");
  const dataURI = `data:application/octet-stream;base64,${base64}`;

  // ✅ Use direct upload (not stream)
  return cloudinary.uploader.upload(dataURI, {
    folder: "myapp/files",
    resource_type: "auto",
    use_filename: !!filename,
    unique_filename: !filename,
    access_mode: "public",
    public_id: filename ? filename.replace(/\.[^/.]+$/, "") : undefined, // Remove extension
  });
}

export async function uploadAudio(buffer: Buffer): Promise<UploadApiResponse> {
  console.log("Uploading Audio");

  // ✅ Convert buffer to base64 data URI
  const base64 = buffer.toString("base64");
  const dataURI = `data:audio/mpeg;base64,${base64}`;

  // ✅ Use direct upload (not stream)
  return cloudinary.uploader.upload(dataURI, {
    folder: "myapp/audio",
    resource_type: "video", // Cloudinary treats audio as video
    format: "mp3",
  });
}

export async function deleteFile(publicId: string): Promise<UploadApiResponse> {
  return cloudinary.uploader.destroy(publicId);
}
