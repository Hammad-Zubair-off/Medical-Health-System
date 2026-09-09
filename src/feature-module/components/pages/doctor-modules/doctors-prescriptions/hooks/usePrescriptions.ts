import { useCallback, useEffect, useState } from "react";
import {
  cancelPrescription,
  listPrescriptions,
} from "../../../../../../core/services/firestore/prescription.service";
import type {
  ListPrescriptionsParams,
  PrescriptionStatus,
} from "../../../../../../core/types/prescription.types";
import type { PrescriptionDoc } from "../../../../../../core/schemas/prescription.schema";

const PAGE_SIZE = 20;

export function usePrescriptions(
  extras: Omit<ListPrescriptionsParams, "pageSize" | "cursor" | "status" | "search"> = {}
) {
  const [prescriptions, setPrescriptions] = useState<PrescriptionDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PrescriptionStatus | "all">("all");

  const fetchPage = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listPrescriptions({
          ...extras,
          pageSize: PAGE_SIZE,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          cursor: append ? cursor : null,
        });
        setPrescriptions((prev) =>
          append
            ? [...prev, ...(result.prescriptions as unknown as PrescriptionDoc[])]
            : (result.prescriptions as unknown as PrescriptionDoc[])
        );
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, statusFilter, cursor, extras.doctorUserId, extras.patientUserId, extras.patientId]
  );

  useEffect(() => {
    setCursor(null);
    void fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter, extras.doctorUserId, extras.patientUserId, extras.patientId]);

  return {
    prescriptions,
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
      await cancelPrescription(id);
      setCursor(null);
      await fetchPage(false);
    },
  };
}
