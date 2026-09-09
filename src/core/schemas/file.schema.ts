import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const resourceTypeSchema = z.enum(["image", "raw", "video"]);
const ownerRoleSchema = z.enum(["doctor", "patient", "admin"]);
const fileStatusSchema = z.enum(["active", "deleted"]);

/**
 * Lenient read schema for FileObject — tolerates missing legacy fields.
 */
export const fileObjectDocSchema = z
  .object({
    _id: z.string(),
    fileName: z.string().nullable().optional().transform((v) => v ?? "file"),
    fileNameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    publicId: z.string().nullable().optional().transform((v) => v ?? ""),
    secureUrl: z.string().nullable().optional().transform((v) => v ?? ""),
    resourceType: resourceTypeSchema
      .nullable()
      .optional()
      .transform((v) => v ?? "raw"),
    format: z.string().nullable().optional().transform((v) => v ?? ""),
    contentType: z.string().nullable().optional().transform((v) => v ?? ""),
    sizeBytes: z.number().nullable().optional().transform((v) => v ?? 0),
    width: z.number().nullable().optional().transform((v) => v ?? null),
    height: z.number().nullable().optional().transform((v) => v ?? null),
    ownerUid: z.string().nullable().optional().transform((v) => v ?? ""),
    ownerRole: ownerRoleSchema
      .nullable()
      .optional()
      .transform((v) => v ?? "patient"),
    sharedWith: z
      .array(z.string())
      .nullable()
      .optional()
      .transform((v) => v ?? []),
    folderId: z.string().nullable().optional().transform((v) => v ?? null),
    appointmentId: z.string().nullable().optional().transform((v) => v ?? null),
    patientId: z.string().nullable().optional().transform((v) => v ?? null),
    doctorId: z.string().nullable().optional().transform((v) => v ?? null),
    description: z.string().nullable().optional().transform((v) => v ?? null),
    status: fileStatusSchema
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
    uploadedAt: timestampSchema,
  })
  .merge(auditFieldsSchema);

export type FileObjectDoc = z.infer<typeof fileObjectDocSchema>;

export const fileFolderDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? "Folder"),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    ownerUid: z.string().nullable().optional().transform((v) => v ?? ""),
    parentFolderId: z.string().nullable().optional().transform((v) => v ?? null),
    status: fileStatusSchema
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type FileFolderDoc = z.infer<typeof fileFolderDocSchema>;

/** Strict client form / pre-upload checks (UX only — Cloudinary enforces for real). */
export const fileUploadFormSchema = z.object({
  description: z.string().max(500).optional(),
  folderId: z.string().nullable().optional(),
  appointmentId: z.string().nullable().optional(),
  sharedWith: z.array(z.string()).optional(),
});

export type FileUploadFormValues = z.infer<typeof fileUploadFormSchema>;
