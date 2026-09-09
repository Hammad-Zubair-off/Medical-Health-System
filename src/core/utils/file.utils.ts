import type { FileResourceType } from "../types/file.types";
import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_BYTES,
} from "../types/file.types";

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let n = bytes;
  let i = 0;
  while (n >= 1024 && i < units.length - 1) {
    n /= 1024;
    i += 1;
  }
  return `${n < 10 && i > 0 ? n.toFixed(1) : Math.round(n)} ${units[i]}`;
}

export function extensionOf(fileName: string): string {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

/**
 * Cloudinary resource type for the upload endpoint.
 * PDFs/DOCX must be `raw` or delivery breaks.
 */
export function resourceTypeFor(fileNameOrExt: string): FileResourceType {
  const ext = extensionOf(fileNameOrExt.includes(".") ? fileNameOrExt : `x.${fileNameOrExt}`);
  if (ext === "jpg" || ext === "jpeg" || ext === "png" || ext === "webp") {
    return "image";
  }
  if (ext === "mp4" || ext === "mov" || ext === "webm") {
    return "video";
  }
  return "raw";
}

export function iconForFormat(format: string): string {
  const f = format.toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(f)) return "ti ti-photo";
  if (f === "pdf") return "ti ti-file-type-pdf";
  if (f === "docx" || f === "doc") return "ti ti-file-type-doc";
  return "ti ti-file";
}

export function isPreviewable(format: string, resourceType: string): boolean {
  const f = format.toLowerCase();
  if (resourceType === "image" || ["jpg", "jpeg", "png", "webp", "gif"].includes(f)) {
    return true;
  }
  return f === "pdf";
}

/**
 * UX-only pre-check. Real enforcement is the Cloudinary unsigned preset
 * (format allow-list + 10 MB max). A caller can bypass this in DevTools.
 */
export function validateUploadClientSide(file: File): string | null {
  const ext = extensionOf(file.name);
  if (
    !(ALLOWED_UPLOAD_EXTENSIONS as readonly string[]).includes(ext)
  ) {
    return `Unsupported type .${ext || "?"}. Allowed: ${ALLOWED_UPLOAD_EXTENSIONS.join(", ")}`;
  }
  if (file.size <= 0) return "File is empty.";
  if (file.size > MAX_UPLOAD_BYTES) {
    return `File exceeds ${formatBytes(MAX_UPLOAD_BYTES)} limit.`;
  }
  return null;
}
