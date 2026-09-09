import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const assetStatuses = ["active", "inactive", "retired"] as const;

export const assetDocSchema = z
  .object({
    _id: z.string(),
    assetId: z.string().nullable().optional().transform((v) => v ?? ""),
    name: z.string().nullable().optional().transform((v) => v ?? "Unnamed"),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    category: z.string().nullable().optional().transform((v) => v ?? null),
    serialNumber: z.string().nullable().optional().transform((v) => v ?? null),
    purchaseDate: timestampSchema,
    purchaseCost: z.number().nullable().optional().transform((v) => v ?? 0),
    assignedToStaffId: z.string().nullable().optional().transform((v) => v ?? null),
    locationId: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(assetStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type AssetDoc = z.infer<typeof assetDocSchema>;

export const assetFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  category: z.string().optional().default(""),
  serialNumber: z.string().optional().default(""),
  purchaseDate: z.string().optional().default(""),
  purchaseCost: z.number().min(0, "Cost cannot be negative"),
  assignedToStaffId: z.string().optional().default(""),
  locationId: z.string().optional().default(""),
  status: z.enum(assetStatuses),
});
