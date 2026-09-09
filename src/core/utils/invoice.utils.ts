import {
  computeBalance,
  type MinorUnits,
} from "./money.utils";
import type { InvoiceStatus } from "../types/invoice.types";

/** Derive invoice status from totals after a payment is recorded. */
export function deriveInvoiceStatusFromPayments(
  total: MinorUnits,
  amountPaid: MinorUnits,
  previousStatus: InvoiceStatus
): InvoiceStatus {
  if (previousStatus === "cancelled") return "cancelled";
  const balance = computeBalance(total, amountPaid);
  if (amountPaid <= 0) {
    return previousStatus === "draft" ? "draft" : "sent";
  }
  if (balance <= 0) return "paid";
  return "partially-paid";
}

export function invoiceStatusLabel(status: InvoiceStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "partially-paid":
      return "Partially Paid";
    case "cancelled":
      return "Cancelled";
    case "overdue":
      return "Overdue";
    case "draft":
      return "Draft";
    case "sent":
    default:
      return "Unpaid";
  }
}
