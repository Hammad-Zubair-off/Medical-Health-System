import { useCallback, useEffect, useState } from "react";
import {
  listPatients,
  setPatientStatus,
} from "../../../../../../core/services/firestore/patient.service";
import type {
  ListPatientsParams,
  PatientStatus,
} from "../../../../../../core/types/patient.types";
import type { PatientDoc } from "../../../../../../core/schemas/patient.schema";
import { useAuth } from "../../../../../../core/context/AuthContext";

export interface UsePatientsReturn {
  patients: PatientDoc[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  search: string;
  setSearch: (value: string) => void;
  statusFilter: PatientStatus | "all";
  setStatusFilter: (value: PatientStatus | "all") => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  deactivatePatient: (id: string) => Promise<void>;
  activatePatient: (id: string) => Promise<void>;
}

const PAGE_SIZE = 20;

export function usePatients(): UsePatientsReturn {
  const { user } = useAuth();
  const [patients, setPatients] = useState<PatientDoc[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "all">("all");

  const fetchPage = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const params: ListPatientsParams = {
          pageSize: PAGE_SIZE,
          search: search || undefined,
          status: statusFilter === "all" ? undefined : statusFilter,
          cursor: append ? cursor : null,
        };
        const result = await listPatients(params);
        setPatients((prev) =>
          append ? [...prev, ...(result.patients as unknown as PatientDoc[])] : (result.patients as unknown as PatientDoc[])
        );
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        console.error("Error listing patients:", err);
        setError(err instanceof Error ? err.message : "Failed to load patients");
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

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchPage(true);
  }, [hasMore, loading, fetchPage]);

  const refresh = useCallback(async () => {
    setCursor(null);
    await fetchPage(false);
  }, [fetchPage]);

  const setPatientStatusAndRefresh = useCallback(
    async (id: string, status: PatientStatus) => {
      await setPatientStatus(id, status, user?.uid);
      setPatients((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status } : p))
      );
    },
    [user?.uid]
  );

  return {
    patients,
    loading,
    error,
    hasMore,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    loadMore,
    refresh,
    deactivatePatient: (id: string) => setPatientStatusAndRefresh(id, "inactive"),
    activatePatient: (id: string) => setPatientStatusAndRefresh(id, "active"),
  };
}
