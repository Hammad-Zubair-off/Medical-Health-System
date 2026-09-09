import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const statuses = ["active", "inactive"] as const;
const employmentTypes = ["full-time", "part-time", "contract", "intern"] as const;

export const staffDocSchema = z
  .object({
    _id: z.string(),
    staffId: z.string().nullable().optional().transform((v) => v ?? ""),
    userId: z.string().nullable().optional().transform((v) => v ?? null),
    displayName: z
      .string()
      .nullable()
      .optional()
      .transform((v) => v ?? "Unknown Staff"),
    displayNameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    email: z.string().nullable().optional().transform((v) => v ?? null),
    phoneNumber: z.string().nullable().optional().transform((v) => v ?? null),
    photoUrl: z.string().nullable().optional().transform((v) => v ?? null),
    departmentId: z.string().nullable().optional().transform((v) => v ?? null),
    departmentName: z.string().nullable().optional().transform((v) => v ?? null),
    designationId: z.string().nullable().optional().transform((v) => v ?? null),
    designationName: z.string().nullable().optional().transform((v) => v ?? null),
    joiningDate: timestampSchema,
    employmentType: z
      .enum(employmentTypes)
      .nullable()
      .optional()
      .transform((v) => v ?? "full-time"),
    status: z
      .enum(statuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type StaffDoc = z.infer<typeof staffDocSchema>;

export const staffFormSchema = z.object({
  displayName: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Enter a valid email").or(z.literal("")),
  phoneNumber: z.string(),
  departmentId: z.string(),
  designationId: z.string(),
  joiningDate: z.string(),
  employmentType: z.enum(employmentTypes),
  status: z.enum(statuses),
  userId: z.string(),
});

export type StaffFormSchema = z.infer<typeof staffFormSchema>;
