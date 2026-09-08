import { useCallback, useEffect, useState } from "react";
import {
  cancelAppointment,
  listAppointments,
  updateAppointment,
} from "../../../../../../core/services/firestore/appointments.service";
import type {
  AppointmentStatus,
  FirestoreAppointment,
  ListAppointmentsParams,
} from "../../../../../../core/types/appointment.types";

export interface UseAppointmentsListReturn {
  appointments: FirestoreAppointment[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  statusFilter: AppointmentStatus | "all";
  setStatusFilter: (value: AppointmentStatus | "all") => void;
  search: string;
  setSearch: (value: string) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  cancel: (id: string, reason?: string) => Promise<void>;
}

const PAGE_SIZE = 20;

export function useAppointmentsList(
  extras: Omit<ListAppointmentsParams, "pageSize" | "cursor" | "status"> = {}
): UseAppointmentsListReturn {
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );

  const fetchPage = useCallback(
    async (append: boolean) => {
      setLoading(true);
      setError(null);
      try {
        const result = await listAppointments({
          ...extras,
          pageSize: PAGE_SIZE,
          status: statusFilter === "all" ? undefined : statusFilter,
          cursor: append ? cursor : null,
        });
        setAppointments((prev) =>
          append ? [...prev, ...result.appointments] : result.appointments
        );
        setCursor(result.nextCursor);
        setHasMore(result.nextCursor !== null);
      } catch (err) {
        console.error("Error listing appointments:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load appointments"
        );
      } finally {
        setLoading(false);
      }
    },
    // extras object identity — callers should pass stable filters
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [statusFilter, cursor, extras.doctorId, extras.doctorUserId, extras.patientId]
  );

  useEffect(() => {
    setCursor(null);
    void fetchPage(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, extras.doctorId, extras.doctorUserId, extras.patientId]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchPage(true);
  }, [hasMore, loading, fetchPage]);

  const refresh = useCallback(async () => {
    setCursor(null);
    await fetchPage(false);
  }, [fetchPage]);

  const setStatus = useCallback(
    async (id: string, status: AppointmentStatus) => {
      await updateAppointment(id, { status });
      await refresh();
    },
    [refresh]
  );

  const cancel = useCallback(
    async (id: string, reason?: string) => {
      await cancelAppointment(id, reason);
      await refresh();
    },
    [refresh]
  );

  const filtered = search.trim()
    ? appointments.filter((a) => {
        const q = search.trim().toLowerCase();
        return (
          (a.patientsName ?? "").toLowerCase().includes(q) ||
          (a.DoctorsName ?? "").toLowerCase().includes(q) ||
          (a.AppointmentId ?? "").toLowerCase().includes(q) ||
          (a.patientsNumber ?? "").toLowerCase().includes(q)
        );
      })
    : appointments;

  return {
    appointments: filtered,
    loading,
    error,
    hasMore,
    statusFilter,
    setStatusFilter,
    search,
    setSearch,
    loadMore,
    refresh,
    setStatus,
    cancel,
  };
}
