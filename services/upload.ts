import { uploadFileWithProgress, type UploadProgressEvent } from "./api";
import { toast } from "sonner";

export interface UploadResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mimeType: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await uploadFileWithProgress<UploadResponse>(
      "/upload",
      formData,
      (progressEvent: UploadProgressEvent) => {
        if (onProgress) {
          onProgress({
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: progressEvent.percentage,
          });
        }
      }
    );

    return response;
  } catch (error) {
    console.error("Error uploading file:", error);
    toast.error("Failed to upload file. Please try again.");
    throw error;
  }
}

export async function uploadMultipleFiles(
  files: File[],
  onProgress?: (fileIndex: number, progress: UploadProgress) => void
): Promise<UploadResponse[]> {
  const uploadPromises = files.map((file, index) =>
    uploadFile(file, (progress) => onProgress?.(index, progress))
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error("Error uploading multiple files:", error);
    toast.error("Some files failed to upload. Please try again.");
    throw error;
  }
}

export function validateFile(
  file: File,
  maxSize: number = 10 * 1024 * 1024
): string | null {
  if (file.size > maxSize) {
    return `File size must be less than ${formatFileSize(maxSize)}`;
  }

  // Add more validation as needed
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileIcon(fileType: string): string {
  if (fileType.startsWith("image/")) return "🖼️";
  if (fileType.startsWith("video/")) return "🎥";
  if (fileType.startsWith("audio/")) return "🎵";
  if (fileType.includes("pdf")) return "📄";
  if (fileType.includes("word") || fileType.includes("document")) return "📝";
  if (fileType.includes("excel") || fileType.includes("spreadsheet"))
    return "📊";
  if (fileType.includes("powerpoint") || fileType.includes("presentation"))
    return "📈";
  if (
    fileType.includes("zip") ||
    fileType.includes("rar") ||
    fileType.includes("tar")
  )
    return "📦";
  return "📎";
}
