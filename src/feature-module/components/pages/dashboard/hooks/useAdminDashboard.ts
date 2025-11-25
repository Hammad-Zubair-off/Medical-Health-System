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
  appointments: FirestoreAppointment[];
  appointmentsWithDetails: Array<FirestoreAppointment & {
    doctor?: { name: string; photoUrl?: string; specialization?: string };
    patient?: { name: string; photoUrl?: string; phone?: string };
  }>;
}

export const useAdminDashboard = (): AdminDashboardData => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    totalDoctors: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    doctorsTrend: 0,
    patientsTrend: 0,
    appointmentsTrend: 0,
    revenueTrend: 0,
  });
  const [appointmentStats, setAppointmentStats] = useState({
    all: 0,
    cancelled: 0,
    rescheduled: 0,
    completed: 0,
  });
  const [popularDoctors, setPopularDoctors] = useState<PopularDoctor[]>([]);
  const [topDepartments, setTopDepartments] = useState<TopDepartment[]>([]);
  const [topPatients, setTopPatients] = useState<TopPatient[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [scheduleStats, setScheduleStats] = useState({
    available: 0,
    unavailable: 0,
    leave: 0,
  });
  const [incomeByTreatment, setIncomeByTreatment] = useState<Array<{
    name: string;
    appointments: number;
    revenue: number;
  }>>([]);
  const [availableDoctors, setAvailableDoctors] = useState<AvailableDoctor[]>([]);
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
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
        ] = await Promise.all([
          getAdminStatistics(),
          getAppointmentStatistics(),
          getPopularDoctors(3),
          getTopDepartments(3),
          getTopPatients(5),
          getRecentTransactions(5),
          getDoctorsScheduleStats(),
          getIncomeByTreatment(),
          getAvailableDoctors(4),
          getAllAppointments(),
        ]);

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
      } catch (err) {
        console.error("Error fetching admin dashboard data:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Appointments with details will be populated as needed in the component
  // For now, we'll return the appointments as-is and let the component handle details
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
    appointments,
    appointmentsWithDetails,
  };
};

