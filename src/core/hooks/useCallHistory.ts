import { useCallback, useEffect, useState } from "react";
import { listMyCalls } from "../services/firestore/call.service";
import type { CallDoc } from "../schemas/call.schema";

export type UseCallHistoryResult = {
  calls: CallDoc[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useCallHistory(uid: string | undefined): UseCallHistoryResult {
  const [calls, setCalls] = useState<CallDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) {
      setCalls([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await listMyCalls(uid, 30, null);
      setCalls(result.calls);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load call history");
    } finally {
      setLoading(false);
    }
  }, [uid]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadMore = useCallback(async () => {
    if (!uid || !hasMore || loading || !cursor) return;
    setLoading(true);
    try {
      const result = await listMyCalls(uid, 30, cursor);
      setCalls((prev) => [...prev, ...result.calls]);
      setCursor(result.nextCursor);
      setHasMore(result.nextCursor !== null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoading(false);
    }
  }, [uid, hasMore, loading, cursor]);

  return { calls, loading, error, hasMore, loadMore, refresh };
}
