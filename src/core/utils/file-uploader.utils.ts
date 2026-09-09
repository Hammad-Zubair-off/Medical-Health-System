import type { FileObjectDoc } from "../schemas/file.schema";

/** Human-readable uploader label for the current viewer. */
export function fileUploaderLabel(
  file: Pick<FileObjectDoc, "ownerUid" | "ownerRole">,
  viewerUid: string | null | undefined
): string {
  if (viewerUid && file.ownerUid === viewerUid) return "You";
  if (file.ownerRole === "doctor") return "Doctor";
  if (file.ownerRole === "patient") return "Patient";
  if (file.ownerRole === "admin") return "Admin";
  return "Someone else";
}

export function fileUploaderBadgeClass(
  file: Pick<FileObjectDoc, "ownerUid" | "ownerRole">,
  viewerUid: string | null | undefined
): string {
  if (viewerUid && file.ownerUid === viewerUid) return "bg-success-subtle text-success";
  if (file.ownerRole === "doctor") return "bg-primary-subtle text-primary";
  if (file.ownerRole === "patient") return "bg-info-subtle text-info";
  return "bg-secondary-subtle text-secondary";
}
