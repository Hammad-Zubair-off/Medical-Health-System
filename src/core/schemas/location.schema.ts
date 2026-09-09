import { z } from "zod";
import { auditFieldsSchema } from "./_shared";

const locationStatuses = ["active", "inactive"] as const;

const addressSchema = z
  .object({
    line1: z.string().nullable().optional().transform((v) => v ?? ""),
    line2: z.string().nullable().optional().transform((v) => v ?? null),
    city: z.string().nullable().optional().transform((v) => v ?? ""),
    state: z.string().nullable().optional().transform((v) => v ?? ""),
    country: z.string().nullable().optional().transform((v) => v ?? ""),
    postalCode: z.string().nullable().optional().transform((v) => v ?? null),
  })
  .nullable()
  .optional()
  .transform((v) => v ?? null);

export const locationDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? "Unnamed"),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    address: addressSchema,
    phoneNumber: z.string().nullable().optional().transform((v) => v ?? null),
    email: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(locationStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type LocationDoc = z.infer<typeof locationDocSchema>;

export const locationFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional().default(""),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().optional().default(""),
  phoneNumber: z.string().optional().default(""),
  email: z.string().email("Invalid email").or(z.literal("")).optional().default(""),
  status: z.enum(locationStatuses),
});
