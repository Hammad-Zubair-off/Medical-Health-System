import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const paymentMethods = [
  "cash",
  "card",
  "bank-transfer",
  "insurance",
  "other",
] as const;

const paymentStatuses = ["completed", "cancelled"] as const;

export const paymentDocSchema = z
  .object({
    _id: z.string(),
    paymentId: z.string().nullable().optional().transform((v) => v ?? ""),
    invoiceId: z.string().nullable().optional().transform((v) => v ?? ""),
    invoiceNumber: z.string().nullable().optional().transform((v) => v ?? null),
    patientId: z.string().nullable().optional().transform((v) => v ?? ""),
    patientUserId: z.string().nullable().optional().transform((v) => v ?? null),
    patientName: z.string().nullable().optional().transform((v) => v ?? null),
    amount: z.number().nullable().optional().transform((v) => v ?? 0),
    method: z
      .enum(paymentMethods)
      .nullable()
      .optional()
      .transform((v) => v ?? "cash"),
    paidOn: timestampSchema,
    reference: z.string().nullable().optional().transform((v) => v ?? null),
    notes: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(paymentStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "completed"),
  })
  .merge(auditFieldsSchema);

export type PaymentDoc = z.infer<typeof paymentDocSchema>;

export const paymentFormSchema = z.object({
  invoiceId: z.string().min(1, "Select an invoice"),
  amount: z.number().positive("Amount must be greater than 0"),
  method: z.enum(paymentMethods, { message: "Select a payment method" }),
  paidOn: z.string().min(1, "Payment date is required"),
  reference: z.string(),
  notes: z.string(),
});

export type PaymentFormSchema = z.infer<typeof paymentFormSchema>;
