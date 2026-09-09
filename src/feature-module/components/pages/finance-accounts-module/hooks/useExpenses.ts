import { useCallback, useEffect, useState } from "react";
import {
  listExpenses,
  setExpenseStatus,
} from "../../../../../core/services/firestore/expense.service";
import type {
  ExpenseStatus,
  ListExpensesParams,
} from "../../../../../core/types/expense.types";
import type { ExpenseDoc } from "../../../../../core/schemas/expense.schema";

const PAGE_SIZE = 20;

export function useExpenses(
  extras: Omit<ListExpensesParams, "pageSize" | "cursor" | "status"> = {}
) {
  const [expenses, setExpenses] = useState<ExpenseDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ExpenseStatus | "all">("active");

  const fetchPage = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listExpenses({
          ...extras,
          pageSize: PAGE_SIZE,
          status: statusFilter === "all" ? undefined : statusFilter,
          cursor: append ? cursor : null,
        });
        setExpenses((prev) =>
          append
            ? [...prev, ...(result.expenses as unknown as ExpenseDoc[])]
            : (result.expenses as unknown as ExpenseDoc[])
        );
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load expenses");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor, extras.categoryId, statusFilter]
  );

  useEffect(() => {
    setCursor(null);
    void fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras.categoryId, statusFilter]);

  return {
    expenses,
    loading,
    error,
    hasMore,
    statusFilter,
    setStatusFilter,
    loadMore: async () => {
      if (!hasMore || loading) return;
      await fetchPage(true);
    },
    refresh: async () => {
      setCursor(null);
      await fetchPage(false);
    },
    deactivate: async (id: string) => {
      await setExpenseStatus(id, "inactive");
      setCursor(null);
      await fetchPage(false);
    },
  };
}
