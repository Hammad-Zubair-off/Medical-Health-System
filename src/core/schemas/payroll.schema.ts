import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const statuses = ["draft", "approved", "paid"] as const;

const lineItemSchema = z.object({
  label: z.string().nullable().optional().transform((v) => v ?? ""),
  amount: z.number().nullable().optional().transform((v) => v ?? 0),
});

export const payrollDocSchema = z
  .object({
    _id: z.string(),
    staffId: z.string().nullable().optional().transform((v) => v ?? ""),
    staffUserId: z.string().nullable().optional().transform((v) => v ?? null),
    staffName: z.string().nullable().optional().transform((v) => v ?? null),
    periodStart: timestampSchema,
    periodEnd: timestampSchema,
    basicSalary: z.number().nullable().optional().transform((v) => v ?? 0),
    allowances: z
      .array(lineItemSchema)
      .nullable()
      .optional()
      .transform((v) => v ?? []),
    deductions: z
      .array(lineItemSchema)
      .nullable()
      .optional()
      .transform((v) => v ?? []),
    netPay: z.number().nullable().optional().transform((v) => v ?? 0),
    status: z
      .enum(statuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "draft"),
    paidOn: timestampSchema,
  })
  .merge(auditFieldsSchema);

export type PayrollDoc = z.infer<typeof payrollDocSchema>;

export const payrollFormSchema = z.object({
  staffId: z.string().min(1, "Select a staff member"),
  periodStart: z.string().min(1, "Period start is required"),
  periodEnd: z.string().min(1, "Period end is required"),
  basicSalary: z.number().min(0, "Salary must be 0 or more"),
  allowances: z.array(
    z.object({
      label: z.string(),
      amount: z.number(),
    })
  ),
  deductions: z.array(
    z.object({
      label: z.string(),
      amount: z.number(),
    })
  ),
  status: z.enum(statuses),
});

export type PayrollFormSchema = z.infer<typeof payrollFormSchema>;
