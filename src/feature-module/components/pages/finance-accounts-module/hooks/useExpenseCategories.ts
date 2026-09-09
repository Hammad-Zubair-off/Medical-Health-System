import { useCallback, useEffect, useState } from "react";
import {
  listExpenseCategories,
  setExpenseCategoryStatus,
} from "../../../../../core/services/firestore/expense.service";
import type { ExpenseCategoryStatus } from "../../../../../core/types/expense.types";
import type { ExpenseCategoryDoc } from "../../../../../core/schemas/expense.schema";

const PAGE_SIZE = 50;

export function useExpenseCategories() {
  const [categories, setCategories] = useState<ExpenseCategoryDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ExpenseCategoryStatus | "all">(
    "active"
  );

  const fetchPage = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listExpenseCategories({
          pageSize: PAGE_SIZE,
          status: statusFilter === "all" ? undefined : statusFilter,
          cursor: append ? cursor : null,
        });
        setCategories((prev) =>
          append
            ? [...prev, ...(result.categories as unknown as ExpenseCategoryDoc[])]
            : (result.categories as unknown as ExpenseCategoryDoc[])
        );
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load expense categories"
        );
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor, statusFilter]
  );

  useEffect(() => {
    setCursor(null);
    void fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return {
    categories,
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
      await setExpenseCategoryStatus(id, "inactive");
      setCursor(null);
      await fetchPage(false);
    },
  };
}
