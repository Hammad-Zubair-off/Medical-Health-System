import { useCallback, useEffect, useState } from "react";
import { listPayments } from "../../../../../core/services/firestore/payment.service";
import type { ListPaymentsParams } from "../../../../../core/types/payment.types";
import type { PaymentDoc } from "../../../../../core/schemas/payment.schema";

const PAGE_SIZE = 20;

export function usePayments(
  extras: Omit<ListPaymentsParams, "pageSize" | "cursor"> = {}
) {
  const [payments, setPayments] = useState<PaymentDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listPayments({
          ...extras,
          pageSize: PAGE_SIZE,
          cursor: append ? cursor : null,
        });
        setPayments((prev) =>
          append
            ? [...prev, ...(result.payments as unknown as PaymentDoc[])]
            : (result.payments as unknown as PaymentDoc[])
        );
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load payments");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cursor, extras.invoiceId, extras.patientId, extras.patientUserId, extras.status]
  );

  useEffect(() => {
    setCursor(null);
    void fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extras.invoiceId, extras.patientId, extras.patientUserId, extras.status]);

  return {
    payments,
    loading,
    error,
    hasMore,
    loadMore: async () => {
      if (!hasMore || loading) return;
      await fetchPage(true);
    },
    refresh: async () => {
      setCursor(null);
      await fetchPage(false);
    },
  };
}
