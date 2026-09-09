import { useCallback, useEffect, useState } from "react";
import { listStaff } from "../../../../../core/services/firestore/staff.service";
import type {
  ListStaffParams,
  StaffStatus,
} from "../../../../../core/types/staff.types";
import type { StaffDoc } from "../../../../../core/schemas/staff.schema";

const PAGE_SIZE = 50;

export function useStaff(
  extras: Omit<ListStaffParams, "pageSize" | "cursor" | "status" | "search"> = {}
) {
  const [staff, setStaff] = useState<StaffDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StaffStatus | "all">("active");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listStaff({
        ...extras,
        pageSize: PAGE_SIZE,
        search: search || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setStaff(result.staff as unknown as StaffDoc[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load staff");
    } finally {
      setLoading(false);
    }
  }, [extras.departmentId, search, statusFilter]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { staff, loading, error, search, setSearch, statusFilter, setStatusFilter, refresh };
}
