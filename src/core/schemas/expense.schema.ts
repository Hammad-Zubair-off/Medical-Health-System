import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const paymentMethods = [
  "cash",
  "card",
  "bank-transfer",
  "insurance",
  "other",
] as const;

const expenseStatuses = ["active", "inactive"] as const;
const categoryStatuses = ["active", "inactive"] as const;

export const expenseDocSchema = z
  .object({
    _id: z.string(),
    expenseId: z.string().nullable().optional().transform((v) => v ?? ""),
    categoryId: z.string().nullable().optional().transform((v) => v ?? ""),
    categoryName: z.string().nullable().optional().transform((v) => v ?? null),
    title: z.string().nullable().optional().transform((v) => v ?? ""),
    amount: z.number().nullable().optional().transform((v) => v ?? 0),
    spentOn: timestampSchema,
    paymentMethod: z
      .enum(paymentMethods)
      .nullable()
      .optional()
      .transform((v) => v ?? "cash"),
    vendor: z.string().nullable().optional().transform((v) => v ?? null),
    receiptUrl: z.string().nullable().optional().transform((v) => v ?? null),
    notes: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(expenseStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type ExpenseDoc = z.infer<typeof expenseDocSchema>;

export const expenseFormSchema = z.object({
  categoryId: z.string().min(1, "Select a category"),
  title: z.string().min(1, "Title is required").max(160),
  amount: z.number().positive("Amount must be greater than 0"),
  spentOn: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(paymentMethods, { message: "Select a payment method" }),
  vendor: z.string(),
  receiptUrl: z.string(),
  notes: z.string(),
  status: z.enum(expenseStatuses),
});

export type ExpenseFormSchema = z.infer<typeof expenseFormSchema>;

export const expenseCategoryDocSchema = z
  .object({
    _id: z.string(),
    name: z.string().nullable().optional().transform((v) => v ?? ""),
    nameLower: z.string().nullable().optional().transform((v) => v ?? ""),
    description: z.string().nullable().optional().transform((v) => v ?? null),
    status: z
      .enum(categoryStatuses)
      .nullable()
      .optional()
      .transform((v) => v ?? "active"),
  })
  .merge(auditFieldsSchema);

export type ExpenseCategoryDoc = z.infer<typeof expenseCategoryDocSchema>;

export const expenseCategoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(80),
  description: z.string(),
  status: z.enum(categoryStatuses),
});

export type ExpenseCategoryFormSchema = z.infer<typeof expenseCategoryFormSchema>;
