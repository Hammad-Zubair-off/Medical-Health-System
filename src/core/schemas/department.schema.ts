import { z } from "zod";
import { auditFieldsSchema } from "./_shared";

const statuses = ["active", "inactive"] as const;

export const departmentDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? ""),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    headStaffId: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(statuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type DepartmentDoc = z.infer<typeof departmentDocSchema>;

export const departmentFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  headStaffId: z.string(),
  status: z.enum(statuses),
});

export type DepartmentFormSchema = z.infer<typeof departmentFormSchema>;

export const designationDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? ""),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    departmentId: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(statuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type DesignationDoc = z.infer<typeof designationDocSchema>;

export const designationFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  departmentId: z.string(),
  status: z.enum(statuses),
});

export type DesignationFormSchema = z.infer<typeof designationFormSchema>;
