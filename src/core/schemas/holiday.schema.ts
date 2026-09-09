import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const statuses = ["active", "inactive"] as const;

export const holidayDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? ""),
    date: timestampSchema,
    isRecurring: z
      .boolean()
      .nullable()
      .optional()
      .transform((v) => v ?? false),
    status: z
      .enum(statuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type HolidayDoc = z.infer<typeof holidayDocSchema>;

export const holidayFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  date: z.string().min(1, "Date is required"),
  isRecurring: z.boolean(),
  status: z.enum(statuses),
});

export type HolidayFormSchema = z.infer<typeof holidayFormSchema>;
