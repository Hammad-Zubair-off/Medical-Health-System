import { z } from "zod";
import { auditFieldsSchema } from "./_shared";

const serviceStatuses = ["active", "inactive"] as const;

export const serviceDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? "Unnamed"),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    specializationId: z.string().nullable().optional().transform((v) => v ?? null),
    specializationName: z.string().nullable().optional().transform((v) => v ?? null),
    price: z.number().nullable().optional().transform((v) => v ?? 0),
    durationMinutes: z.number().nullable().optional().transform((v) => v ?? null),
    description: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(serviceStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type ServiceDoc = z.infer<typeof serviceDocSchema>;

export const serviceFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  specializationId: z.string().optional().default(""),
  price: z.number().min(0, "Price cannot be negative"),
  durationMinutes: z.number().int().min(0).optional().default(30),
  description: z.string().optional().default(""),
  status: z.enum(serviceStatuses),
});
