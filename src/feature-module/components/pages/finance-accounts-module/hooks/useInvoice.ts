import { useCallback, useEffect, useState } from "react";
import { getInvoice } from "../../../../../core/services/firestore/invoice.service";
import type { InvoiceDoc } from "../../../../../core/schemas/invoice.schema";

export function useInvoice(id: string | undefined) {
  const [invoice, setInvoice] = useState<InvoiceDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(async () => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const result = await getInvoice(id);
      if (!result) {
        setNotFound(true);
        setInvoice(null);
      } else {
        setInvoice(result);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load invoice";
      if (/not.?found|permission|insufficient|Missing/i.test(msg)) {
        setNotFound(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { invoice, loading, error, notFound, refresh };
}
