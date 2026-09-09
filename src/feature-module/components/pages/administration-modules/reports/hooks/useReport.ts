import { useCallback, useEffect, useState } from "react";
import {
  ReportRangeError,
  defaultDateRange,
  type DateRange,
} from "../../../../../../core/utils/report.utils";

export function useReport<T>(
  fetcher: (range: DateRange) => Promise<T>,
  initialRange: DateRange = defaultDateRange()
) {
  const [range, setRange] = useState<DateRange>(initialRange);
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(range);
      setData(result);
    } catch (err) {
      const message =
        err instanceof ReportRangeError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to load report";
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fetcher, range]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { range, setRange, data, loading, error, refresh };
}
