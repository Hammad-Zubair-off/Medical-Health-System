export type FileOwnerRole = "doctor" | "patient" | "admin";
export type FileResourceType = "image" | "raw" | "video";
export type FileStatus = "active" | "deleted";
export type FolderStatus = "active" | "deleted";

export type UploadTaskStatus =
  | "queued"
  | "uploading"
  | "saving"
  | "done"
  | "error"
  | "cancelled";

export type UploadTask = {
  id: string;
  file: File;
  progress: number;
  status: UploadTaskStatus;
  error?: string | null;
  fileObjectId?: string | null;
};

export type ListFilesParams = {
  ownerUid?: string;
  sharedWithUid?: string;
  appointmentId?: string;
  folderId?: string | null;
  patientId?: string;
  pageSize?: number;
  cursor?: string | null;
  status?: FileStatus;
};

export type ListFilesResult = {
  files: import("../schemas/file.schema").FileObjectDoc[];
  nextCursor: string | null;
};

export type CreateFileObjectInput = {
  fileName: string;
  publicId: string;
  secureUrl: string;
  resourceType: FileResourceType;
  format: string;
  contentType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  ownerUid: string;
  ownerRole: FileOwnerRole;
  sharedWith?: string[];
  folderId?: string | null;
  appointmentId?: string | null;
  patientId?: string | null;
  doctorId?: string | null;
  description?: string | null;
};

export type UpdateFileObjectInput = {
  fileName?: string;
  sharedWith?: string[];
  folderId?: string | null;
  description?: string | null;
  status?: FileStatus;
};

export type CreateFolderInput = {
  name: string;
  ownerUid: string;
  parentFolderId?: string | null;
};

/** Soft quota per user (advisory UX only). Real caps are on the Cloudinary preset. */
export const USER_STORAGE_SOFT_QUOTA_BYTES = 200 * 1024 * 1024;

/** Matches Cloudinary preset max (10 MB). Client check is UX-only. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export const ALLOWED_UPLOAD_EXTENSIONS = [
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "docx",
] as const;
