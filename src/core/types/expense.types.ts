import type { Timestamp } from "firebase/firestore";
import type { MinorUnits } from "../utils/money.utils";
import type { PaymentMethod } from "./payment.types";

export type ExpenseStatus = "active" | "inactive";
export type ExpenseCategoryStatus = "active" | "inactive";

/** `Expense/{id}` document shape. `amount` is minor units. */
export interface Expense {
  _id: string;
  expenseId: string;
  categoryId: string;
  categoryName: string | null;
  title: string;
  amount: MinorUnits;
  spentOn: Timestamp | Date | null;
  paymentMethod: PaymentMethod;
  vendor: string | null;
  receiptUrl: string | null;
  notes: string | null;
  status: ExpenseStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface ExpenseFormValues {
  categoryId: string;
  title: string;
  /** Major units. */
  amount: number;
  spentOn: string;
  paymentMethod: PaymentMethod;
  vendor: string;
  receiptUrl: string;
  notes: string;
  status: ExpenseStatus;
}

export interface ListExpensesParams {
  categoryId?: string;
  status?: ExpenseStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListExpensesResult {
  expenses: Expense[];
  nextCursor: string | null;
}

/** `ExpenseCategory/{id}` document shape. */
export interface ExpenseCategory {
  _id: string;
  name: string;
  nameLower: string;
  description: string | null;
  status: ExpenseCategoryStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface ExpenseCategoryFormValues {
  name: string;
  description: string;
  status: ExpenseCategoryStatus;
}

export interface ListExpenseCategoriesParams {
  status?: ExpenseCategoryStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListExpenseCategoriesResult {
  categories: ExpenseCategory[];
  nextCursor: string | null;
}

/** Derived view row — payments + expenses merged (not a collection). */
export type TransactionKind = "income" | "expense";

export interface TransactionRow {
  id: string;
  kind: TransactionKind;
  date: Timestamp | Date | null;
  title: string;
  amount: MinorUnits;
  method: PaymentMethod | string | null;
  status: string;
  referenceId: string | null;
}
