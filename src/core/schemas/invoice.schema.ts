import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const invoiceLineItemDocSchema = z.object({
  description: z.string().nullable().optional().transform((v) => v ?? ""),
  quantity: z.number().nullable().optional().transform((v) => v ?? 0),
  unitPrice: z.number().nullable().optional().transform((v) => v ?? 0),
  amount: z.number().nullable().optional().transform((v) => v ?? 0),
});

const invoiceStatuses = [
  "draft",
  "sent",
  "partially-paid",
  "paid",
  "overdue",
  "cancelled",
] as const;

/**
 * Lenient read schema — tolerates legacy/missing fields rather than throwing
 * (see `parseDoc`).
 */
export const invoiceDocSchema = z
  .object({
    _id: z.string(),
    invoiceNumber: z.string().nullable().optional().transform((v) => v ?? ""),
    appointmentId: z.string().nullable().optional().transform((v) => v ?? null),
    patientId: z.string().nullable().optional().transform((v) => v ?? ""),
    patientUserId: z.string().nullable().optional().transform((v) => v ?? null),
    patientName: z.string().nullable().optional().transform((v) => v ?? null),
    patientNameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    doctorId: z.string().nullable().optional().transform((v) => v ?? null),
    doctorUserId: z.string().nullable().optional().transform((v) => v ?? null),
    doctorName: z.string().nullable().optional().transform((v) => v ?? null),
    issuedOn: timestampSchema,
    dueDate: timestampSchema,
    lineItems: z
      .array(invoiceLineItemDocSchema)
      .nullable()
      .optional()
      .transform((v) => v ?? []),
    subtotal: z.number().nullable().optional().transform((v) => v ?? 0),
    taxRate: z.number().nullable().optional().transform((v) => v ?? 0),
    taxAmount: z.number().nullable().optional().transform((v) => v ?? 0),
    discount: z.number().nullable().optional().transform((v) => v ?? 0),
    total: z.number().nullable().optional().transform((v) => v ?? 0),
    amountPaid: z.number().nullable().optional().transform((v) => v ?? 0),
    balance: z.number().nullable().optional().transform((v) => v ?? 0),
    status: z
      .enum(invoiceStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "draft"),
    notes: z.string().nullable().optional().transform((v) => v ?? null),
  })
  .merge(auditFieldsSchema);

export type InvoiceDoc = z.infer<typeof invoiceDocSchema>;

const invoiceLineItemFormSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
});

/** Strict write schema — validates create/edit invoice forms. */
export const invoiceFormSchema = z.object({
  appointmentId: z.string(),
  patientId: z.string().min(1, "Select a patient"),
  doctorId: z.string(),
  issuedOn: z.string().min(1, "Issue date is required"),
  dueDate: z.string(),
  lineItems: z
    .array(invoiceLineItemFormSchema)
    .min(1, "Add at least one line item"),
  taxRatePercent: z.number().min(0).max(100),
  discount: z.number().min(0),
  notes: z.string(),
  status: z.enum(invoiceStatuses),
});

export type InvoiceFormSchema = z.infer<typeof invoiceFormSchema>;
