import { z } from "zod";
import { auditFieldsSchema } from "./_shared";

export const specializationDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? "Unnamed"),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    description: z.string().nullable().optional().transform((v) => v ?? null),
    icon: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(["active", "inactive"])
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type SpecializationDoc = z.infer<typeof specializationDocSchema>;

export const specializationFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string().optional().default(""),
  icon: z.string().optional().default(""),
  status: z.enum(["active", "inactive"]),
});
