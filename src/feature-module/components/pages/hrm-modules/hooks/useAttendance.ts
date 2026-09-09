import { useCallback, useEffect, useState } from "react";
import { listAttendance } from "../../../../../core/services/firestore/attendance.service";
import type { AttendanceDoc } from "../../../../../core/schemas/attendance.schema";

export function useAttendance(extras: { staffId?: string; fromDate?: string; toDate?: string } = {}) {
  const [records, setRecords] = useState<AttendanceDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAttendance({
        pageSize: 100,
        staffId: extras.staffId,
        fromDate: extras.fromDate,
        toDate: extras.toDate,
      });
      setRecords(result.records as unknown as AttendanceDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }, [extras.staffId, extras.fromDate, extras.toDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { records, loading, error, refresh };
}
