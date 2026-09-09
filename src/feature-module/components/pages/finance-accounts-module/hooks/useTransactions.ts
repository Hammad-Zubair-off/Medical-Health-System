import { useCallback, useEffect, useState } from "react";
import { listPayments } from "../../../../../core/services/firestore/payment.service";
import { listExpenses } from "../../../../../core/services/firestore/expense.service";
import { toMillis } from "../../../../../core/utils/firestore.utils";
import type { TransactionRow } from "../../../../../core/types/expense.types";

/**
 * Transactions is not a collection — merge payments (income) + expenses,
 * sorted by date descending.
 */
export function useTransactions() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [paymentsResult, expensesResult] = await Promise.all([
        listPayments({ status: "completed", pageSize: 50 }),
        listExpenses({ status: "active", pageSize: 50 }),
      ]);

      const rows: TransactionRow[] = [
        ...paymentsResult.payments.map((p) => ({
          id: p._id,
          kind: "income" as const,
          date: p.paidOn,
          title: p.patientName
            ? `Payment — ${p.patientName}`
            : `Payment ${p.paymentId}`,
          amount: p.amount,
          method: p.method,
          status: p.status,
          referenceId: p.invoiceId,
        })),
        ...expensesResult.expenses.map((e) => ({
          id: e._id,
          kind: "expense" as const,
          date: e.spentOn,
          title: e.title,
          amount: e.amount,
          method: e.paymentMethod,
          status: e.status,
          referenceId: e.categoryId,
        })),
      ];

      rows.sort((a, b) => (toMillis(b.date) ?? 0) - (toMillis(a.date) ?? 0));
      setTransactions(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { transactions, loading, error, refresh };
}
