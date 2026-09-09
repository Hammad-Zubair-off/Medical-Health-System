import { useState, useEffect, useMemo } from "react";
import {
  getAdminStatistics,
  getAppointmentStatistics,
  getPopularDoctors,
  getTopDepartments,
  getTopPatients,
  getRecentTransactions,
  getDoctorsScheduleStats,
  getIncomeByTreatment,
  getAllAppointments,
  getAvailableDoctors,
  type PopularDoctor,
  type TopDepartment,
  type TopPatient,
  type RecentTransaction,
  type AvailableDoctor,
} from "../../../../../core/services/firestore/admin.service";
import type { FirestoreAppointment } from "../../../../../core/services/firestore/appointments.service";
import { listLeaves } from "../../../../../core/services/firestore/leave.service";
import type { Leave } from "../../../../../core/types/leave.types";

const DASHBOARD_TIMEOUT_MS = 22000;

async function withTimeout<T>(
  promise: Promise<T>,
  fallback: T,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((resolve) => {
        timer = setTimeout(() => {
          console.warn(`[AdminDashboard] ${label} timed out after ${DASHBOARD_TIMEOUT_MS}ms`);
          resolve(fallback);
        }, DASHBOARD_TIMEOUT_MS);
      }),
    ]);
  } catch (err) {
    console.error(`[AdminDashboard] ${label} failed:`, err);
    return fallback;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export interface AdminDashboardData {
  loading: boolean;
  error: string | null;
  statistics: {
    totalDoctors: number;
    totalPatients: number;
    totalAppointments: number;
    totalRevenue: number;
    doctorsTrend: number;
    patientsTrend: number;
    appointmentsTrend: number;
    revenueTrend: number;
  };
  appointmentStats: {
    all: number;
    cancelled: number;
    rescheduled: number;
    completed: number;
  };
  popularDoctors: PopularDoctor[];
  topDepartments: TopDepartment[];
  topPatients: TopPatient[];
  recentTransactions: RecentTransaction[];
  scheduleStats: {
    available: number;
    unavailable: number;
    leave: number;
  };
  incomeByTreatment: Array<{
    name: string;
    appointments: number;
    revenue: number;
  }>;
  availableDoctors: AvailableDoctor[];
  pendingLeaves: Leave[];
  appointments: FirestoreAppointment[];
  appointmentsWithDetails: Array<
    FirestoreAppointment & {
      doctor?: { name: string; photoUrl?: string; specialization?: string };
      patient?: { name: string; photoUrl?: string; phone?: string };
    }
  >;
  refreshLeaves: () => Promise<void>;
}

const emptyStats = {
  totalDoctors: 0,
  totalPatients: 0,
  totalAppointments: 0,
  totalRevenue: 0,
  doctorsTrend: 0,
  patientsTrend: 0,
  appointmentsTrend: 0,
  revenueTrend: 0,
};

export const useAdminDashboard = (): AdminDashboardData => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState(emptyStats);
  const [appointmentStats, setAppointmentStats] = useState({
    all: 0,
    cancelled: 0,
    rescheduled: 0,
    completed: 0,
  });
  const [popularDoctors, setPopularDoctors] = useState<PopularDoctor[]>([]);
  const [topDepartments, setTopDepartments] = useState<TopDepartment[]>([]);
  const [topPatients, setTopPatients] = useState<TopPatient[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<
    RecentTransaction[]
  >([]);
  const [scheduleStats, setScheduleStats] = useState({
    available: 0,
    unavailable: 0,
    leave: 0,
  });
  const [incomeByTreatment, setIncomeByTreatment] = useState<
    Array<{ name: string; appointments: number; revenue: number }>
  >([]);
  const [availableDoctors, setAvailableDoctors] = useState<AvailableDoctor[]>(
    []
  );
  const [pendingLeaves, setPendingLeaves] = useState<Leave[]>([]);
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);

  const refreshLeaves = async () => {
    try {
      const { leaves } = await listLeaves({ status: "pending", pageSize: 5 });
      setPendingLeaves(leaves);
    } catch (err) {
      console.error("Error refreshing leaves:", err);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const emptyAptStats = {
          all: 0,
          cancelled: 0,
          rescheduled: 0,
          completed: 0,
        };
        const emptySchedule = { available: 0, unavailable: 0, leave: 0 };

        const [
          stats,
          aptStats,
          popular,
          departments,
          patients,
          transactions,
          schedule,
          income,
          available,
          allAppointments,
          leaveResult,
        ] = await Promise.all([
          withTimeout(getAdminStatistics(), emptyStats, "statistics"),
          withTimeout(
            getAppointmentStatistics(),
            emptyAptStats,
            "appointmentStats"
          ),
          withTimeout(getPopularDoctors(3), [], "popularDoctors"),
          withTimeout(getTopDepartments(3), [], "topDepartments"),
          withTimeout(getTopPatients(5), [], "topPatients"),
          withTimeout(getRecentTransactions(5), [], "transactions"),
          withTimeout(getDoctorsScheduleStats(), emptySchedule, "schedule"),
          withTimeout(getIncomeByTreatment(), [], "income"),
          withTimeout(getAvailableDoctors(4), [], "availableDoctors"),
          withTimeout(getAllAppointments(), [], "appointments"),
          withTimeout(
            listLeaves({ status: "pending", pageSize: 5 }).catch(() => ({
              leaves: [] as Leave[],
              nextCursor: null,
            })),
            { leaves: [] as Leave[], nextCursor: null },
            "leaves"
          ),
        ]);

        if (cancelled) return;

        setStatistics(stats);
        setAppointmentStats(aptStats);
        setPopularDoctors(popular);
        setTopDepartments(departments);
        setTopPatients(patients);
        setRecentTransactions(transactions);
        setScheduleStats(schedule);
        setIncomeByTreatment(income);
        setAvailableDoctors(available);
        setAppointments(allAppointments);
        setPendingLeaves(leaveResult.leaves);
      } catch (err) {
        if (!cancelled) {
          console.error("Error fetching admin dashboard data:", err);
          setError(
            err instanceof Error ? err.message : "Failed to load dashboard data"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchDashboardData();
    return () => {
      cancelled = true;
    };
  }, []);

  const appointmentsWithDetails = useMemo(() => {
    return appointments.map((apt) => ({
      ...apt,
      doctor: {
        name: apt.DoctorsName || "Unknown Doctor",
        photoUrl: undefined,
        specialization: undefined,
      },
      patient: {
        name: apt.patientsName || "Unknown Patient",
        photoUrl: undefined,
        phone: apt.patientsNumber,
      },
    }));
  }, [appointments]);

  return {
    loading,
    error,
    statistics,
    appointmentStats,
    popularDoctors,
    topDepartments,
    topPatients,
    recentTransactions,
    scheduleStats,
    incomeByTreatment,
    availableDoctors,
    pendingLeaves,
    appointments,
    appointmentsWithDetails,
    refreshLeaves,
  };
};
