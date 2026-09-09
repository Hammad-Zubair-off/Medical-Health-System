import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const typeStatuses = ["active", "inactive"] as const;
const leaveStatuses = ["pending", "approved", "rejected"] as const;

export const leaveTypeDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? ""),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    daysAllowedPerYear: z
      .number()
      .nullable()
      .optional()
      .transform((v) => v ?? 0),
    isPaid: z
      .boolean()
      .nullable()
      .optional()
      .transform((v) => v ?? true),
    status: z
      .enum(typeStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type LeaveTypeDoc = z.infer<typeof leaveTypeDocSchema>;

export const leaveTypeFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  daysAllowedPerYear: z.number().min(0, "Must be 0 or more"),
  isPaid: z.boolean(),
  status: z.enum(typeStatuses),
});

export type LeaveTypeFormSchema = z.infer<typeof leaveTypeFormSchema>;

export const leaveDocSchema = z
  .object({
    _id: z.string(),
    staffId: z.string().nullable().optional().transform((v) => v ?? ""),
    staffUserId: z.string().nullable().optional().transform((v) => v ?? null),
    staffName: z.string().nullable().optional().transform((v) => v ?? null),
    leaveTypeId: z.string().nullable().optional().transform((v) => v ?? ""),
    leaveTypeName: z.string().nullable().optional().transform((v) => v ?? null),
    from: timestampSchema,
    to: timestampSchema,
    days: z.number().nullable().optional().transform((v) => v ?? 0),
    reason: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(leaveStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "pending"),
    reviewedBy: z.string().nullable().optional().transform((v) => v ?? null),
    reviewedOn: timestampSchema,
  })
  .merge(auditFieldsSchema);

export type LeaveDoc = z.infer<typeof leaveDocSchema>;

export const leaveFormSchema = z.object({
  staffId: z.string().min(1, "Select a staff member"),
  leaveTypeId: z.string().min(1, "Select a leave type"),
  from: z.string().min(1, "From date is required"),
  to: z.string().min(1, "To date is required"),
  reason: z.string(),
});

export type LeaveFormSchema = z.infer<typeof leaveFormSchema>;
