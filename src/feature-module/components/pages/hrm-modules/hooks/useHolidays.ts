import { useCallback, useEffect, useState } from "react";
import { listHolidays } from "../../../../../core/services/firestore/holiday.service";
import type { HolidayDoc } from "../../../../../core/schemas/holiday.schema";

export function useHolidays() {
  const [holidays, setHolidays] = useState<HolidayDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listHolidays({ pageSize: 100, status: "active" });
      setHolidays(result.holidays as unknown as HolidayDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load holidays");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { holidays, loading, error, refresh };
}
