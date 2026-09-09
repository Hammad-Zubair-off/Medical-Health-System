import type { Timestamp } from "firebase/firestore";
import type { MinorUnits } from "../utils/money.utils";

export type PayrollStatus = "draft" | "approved" | "paid";

export interface PayrollLineItem {
  label: string;
  amount: MinorUnits;
}

/** `Payroll/{id}` — money fields are integer minor units. */
export interface Payroll {
  _id: string;
  staffId: string;
  staffUserId: string | null;
  staffName: string | null;
  periodStart: Timestamp | Date | null;
  periodEnd: Timestamp | Date | null;
  basicSalary: MinorUnits;
  allowances: PayrollLineItem[];
  deductions: PayrollLineItem[];
  netPay: MinorUnits;
  status: PayrollStatus;
  paidOn: Timestamp | Date | null;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface PayrollFormValues {
  staffId: string;
  periodStart: string;
  periodEnd: string;
  /** Major units. */
  basicSalary: number;
  allowances: Array<{ label: string; amount: number }>;
  deductions: Array<{ label: string; amount: number }>;
  status: PayrollStatus;
}

export interface ListPayrollParams {
  staffId?: string;
  staffUserId?: string;
  status?: PayrollStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListPayrollResult {
  payrolls: Payroll[];
  nextCursor: string | null;
}
