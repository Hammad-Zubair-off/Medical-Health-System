import { useCallback, useEffect, useState } from "react";
import {
  listDoctors,
  type DoctorData,
  type DoctorStatus,
} from "../../../../../../core/services/firestore/doctor.service";

export interface UseDoctorsReturn {
  doctors: DoctorData[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: DoctorStatus | "all";
  setStatusFilter: (value: DoctorStatus | "all") => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

const PAGE_SIZE = 20;

/** List doctors (list/grid/browse). See `useDoctor` for a single doctor. */
export function useDoctors(defaultStatus: DoctorStatus | "all" = "all"): UseDoctorsReturn {
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<DoctorStatus | "all">(defaultStatus);

  const fetchPage = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listDoctors({
          pageSize: PAGE_SIZE,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          cursor: append ? cursor : null,
        });
        setDoctors((prev) => (append ? [...prev, ...result.doctors] : result.doctors));
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        console.error("Error listing doctors:", err);
        setError(err instanceof Error ? err.message : "Failed to load doctors");
      } finally {
        setLoading(false);
      }
    },
    [search, statusFilter, cursor]
  );

  useEffect(() => {
    void fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  return {
    doctors,
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
  };
}
