import { usePayments } from "./usePayments";

/**
 * Income is not a collection — it is the payments-received view.
 */
export function useIncome() {
  const result = usePayments({ status: "completed" });
  return {
    income: result.payments,
    loading: result.loading,
    error: result.error,
    hasMore: result.hasMore,
    loadMore: result.loadMore,
    refresh: result.refresh,
  };
}
