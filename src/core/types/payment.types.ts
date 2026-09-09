import type { Timestamp } from "firebase/firestore";
import type { MinorUnits } from "../utils/money.utils";

export type PaymentMethod =
  | "cash"
  | "card"
  | "bank-transfer"
  | "insurance"
  | "other";

export type PaymentStatus = "completed" | "cancelled";

/** `Payment/{id}` document shape. `amount` is minor units. */
export interface Payment {
  _id: string;
  paymentId: string;
  invoiceId: string;
  invoiceNumber: string | null;
  patientId: string;
  patientUserId: string | null;
  patientName: string | null;
  amount: MinorUnits;
  method: PaymentMethod;
  paidOn: Timestamp | Date | null;
  reference: string | null;
  notes: string | null;
  status: PaymentStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface PaymentFormValues {
  invoiceId: string;
  /** Major units. */
  amount: number;
  method: PaymentMethod;
  paidOn: string;
  reference: string;
  notes: string;
}

export interface ListPaymentsParams {
  invoiceId?: string;
  patientId?: string;
  patientUserId?: string;
  status?: PaymentStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListPaymentsResult {
  payments: Payment[];
  nextCursor: string | null;
}
