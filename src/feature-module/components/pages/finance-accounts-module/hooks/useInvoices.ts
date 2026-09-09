import { useCallback, useEffect, useState } from "react";
import {
  cancelInvoice,
  listInvoices,
} from "../../../../../core/services/firestore/invoice.service";
import type {
  InvoiceStatus,
  ListInvoicesParams,
} from "../../../../../core/types/invoice.types";
import type { InvoiceDoc } from "../../../../../core/schemas/invoice.schema";

const PAGE_SIZE = 20;

export function useInvoices(
  extras: Omit<ListInvoicesParams, "pageSize" | "cursor" | "status" | "search"> = {}
) {
  const [invoices, setInvoices] = useState<InvoiceDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");

  const fetchPage = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listInvoices({
          ...extras,
          pageSize: PAGE_SIZE,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          cursor: append ? cursor : null,
        });
        setInvoices((prev) =>
          append
            ? [...prev, ...(result.invoices as unknown as InvoiceDoc[])]
            : (result.invoices as unknown as InvoiceDoc[])
        );
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoices");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      search,
      statusFilter,
      cursor,
      extras.patientId,
      extras.patientUserId,
      extras.doctorUserId,
    ]
  );

  useEffect(() => {
    setCursor(null);
    void fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, extras.patientId, extras.patientUserId, extras.doctorUserId]);

  return {
    invoices,
    loading,
    error,
    hasMore,
    search,
    setSearch,
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
    cancel: async (id: string) => {
      await cancelInvoice(id);
      setCursor(null);
      await fetchPage(false);
    },
  };
}
