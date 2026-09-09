import type { Timestamp } from "firebase/firestore";
import type { MinorUnits } from "../utils/money.utils";

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "partially-paid"
  | "paid"
  | "overdue"
  | "cancelled";

/** Line item amounts are integer minor units (paisa/cents). */
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: MinorUnits;
  amount: MinorUnits;
}

/** `Invoice/{id}` document shape. Money fields are minor units. */
export interface Invoice {
  _id: string;
  invoiceNumber: string;
  appointmentId: string | null;
  patientId: string;
  patientUserId: string | null;
  patientName: string | null;
  patientNameLower: string;
  doctorId: string | null;
  /** Users/{uid} of the doctor — required for security rules (cannot join). */
  doctorUserId: string | null;
  doctorName: string | null;
  issuedOn: Timestamp | Date | null;
  dueDate: Timestamp | Date | null;
  lineItems: InvoiceLineItem[];
  subtotal: MinorUnits;
  /** Tax rate in basis points (500 = 5%). */
  taxRate: number;
  taxAmount: MinorUnits;
  discount: MinorUnits;
  total: MinorUnits;
  amountPaid: MinorUnits;
  balance: MinorUnits;
  status: InvoiceStatus;
  notes: string | null;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

/** Form input — prices in major units; service converts to minor. */
export interface InvoiceFormValues {
  appointmentId: string;
  patientId: string;
  doctorId: string;
  issuedOn: string;
  dueDate: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    /** Major units (e.g. 12.50). */
    unitPrice: number;
  }>;
  /** Percent, e.g. 5 for 5%. */
  taxRatePercent: number;
  /** Major units. */
  discount: number;
  notes: string;
  status: InvoiceStatus;
}

export interface ListInvoicesParams {
  search?: string;
  status?: InvoiceStatus;
  patientId?: string;
  patientUserId?: string;
  doctorUserId?: string;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListInvoicesResult {
  invoices: Invoice[];
  nextCursor: string | null;
}
