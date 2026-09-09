import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const statuses = ["present", "absent", "holiday", "half-day", "leave"] as const;

export const attendanceDocSchema = z
  .object({
    _id: z.string(),
    staffId: z.string().nullable().optional().transform((v) => v ?? ""),
    staffName: z.string().nullable().optional().transform((v) => v ?? null),
    date: timestampSchema,
    checkIn: timestampSchema,
    checkOut: timestampSchema,
    status: z
      .enum(statuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "present"),
    workedMinutes: z.number().nullable().optional().transform((v) => v ?? 0),
  })
  .merge(auditFieldsSchema);

export type AttendanceDoc = z.infer<typeof attendanceDocSchema>;

export const attendanceFormSchema = z.object({
  staffId: z.string().min(1, "Select a staff member"),
  date: z.string().min(1, "Date is required"),
  checkIn: z.string(),
  checkOut: z.string(),
  status: z.enum(statuses),
});

export type AttendanceFormSchema = z.infer<typeof attendanceFormSchema>;
