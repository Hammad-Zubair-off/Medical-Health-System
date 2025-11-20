import { useState, useEffect, useMemo, useCallback } from "react";
import {
  getDoctorAppointments,
  getUpcomingAppointments,
  getAppointmentsWithPatients,
  type FirestoreAppointment,
} from "../../../../../../core/services/firestore/appointments.service";
import { getDoctorDataByUserId, type DoctorTimeSlots, type DoctorEnabledDays } from "../../../../../../core/services/firestore/doctor.service";
import { Timestamp } from "firebase/firestore";

interface DashboardStatistics {
  totalAppointments: number;
  onlineConsultations: number;
  cancelledAppointments: number;
  totalPatients: number;
  videoConsultations: number;
  rescheduled: number;
  preVisitBookings: number;
  walkinBookings: number;
  followUps: number;
  completed: number;
  pending: number;
  cancelled: number;
  upcoming: number;
  confirmed: number;
}

interface TrendData {
  percentage: number;
  isPositive: boolean;
  formatted: string;
  icon: "arrow-up" | "arrow-down";
  color: "success" | "danger";
  badgeColor: "success" | "danger" | "warning" | "info";
}

interface DashboardTrends {
  totalAppointmentsTrend: TrendData;
  onlineConsultationsTrend: TrendData;
  cancelledTrend: TrendData;
  completedTrend: TrendData;
  totalPatientsTrend: TrendData;
  videoConsultationsTrend: TrendData;
  rescheduledTrend: TrendData;
  preVisitBookingsTrend: TrendData;
  walkinBookingsTrend: TrendData;
  followUpsTrend: TrendData;
  upcomingTrend: TrendData;
  confirmedTrend: TrendData;
}

interface AvailabilitySchedule {
  monday?: { start: string; end: string } | null;
  tuesday?: { start: string; end: string } | null;
  wednesday?: { start: string; end: string } | null;
  thursday?: { start: string; end: string } | null;
  friday?: { start: string; end: string } | null;
  saturday?: { start: string; end: string } | null;
  sunday?: { start: string; end: string } | null;
}

interface DashboardData {
  appointments: FirestoreAppointment[];
  upcomingAppointments: FirestoreAppointment[];
  appointmentsWithPatients: (FirestoreAppointment & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } })[];
  statistics: DashboardStatistics;
  trends: DashboardTrends;
  availabilitySchedule: AvailabilitySchedule;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook for doctor dashboard data
 * @param doctorUserId - The doctor's user ID (uid from Users collection)
 * @returns Dashboard data including appointments, statistics, and loading states
 */
export const useDoctorDashboard = (doctorUserId: string | null): DashboardData => {
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<FirestoreAppointment[]>([]);
  const [appointmentsWithPatients, setAppointmentsWithPatients] = useState<
    (FirestoreAppointment & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } })[]
  >([]);
  const [availabilitySchedule, setAvailabilitySchedule] = useState<AvailabilitySchedule>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to format time from Timestamp
  const formatTime = (timestamp: Timestamp | Date | undefined): string => {
    if (!timestamp) return "";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper to check if time is 0:00 (midnight) - meaning not set
  const isTimeNotSet = (date: Date): boolean => {
    return date.getHours() === 0 && date.getMinutes() === 0;
  };

  // Helper to parse time slots from Doctor data
  const parseTimeSlots = useCallback((timeSlots: DoctorTimeSlots | Record<string, unknown> | undefined, enabledDays?: DoctorEnabledDays): AvailabilitySchedule => {
    if (!timeSlots) {
      return {};
    }

    const slots = timeSlots as Record<string, unknown>;
    const schedule: AvailabilitySchedule = {};

    // Helper to get time range for a day
    const getDaySchedule = (dayName: string): { start: string; end: string } | null => {
      // Check if day is enabled
      const dayKey = dayName.toLowerCase() as keyof DoctorEnabledDays;
      const isEnabled = enabledDays?.[dayKey] || false;
      
      if (!isEnabled) {
        return null; // Day is not enabled
      }

      const startKey = `${dayName}Start`;
      const endKey = `${dayName}End`;
      
      const start = slots[startKey] as Timestamp | Date | undefined;
      const end = slots[endKey] as Timestamp | Date | undefined;
      
      if (!start || !end) {
        return null; // Missing times
      }

      // Convert to Date objects
      let startDate: Date | null = null;
      let endDate: Date | null = null;

      if (start instanceof Timestamp) {
        startDate = start.toDate();
      } else if (start instanceof Date) {
        startDate = start;
      }

      if (end instanceof Timestamp) {
        endDate = end.toDate();
      } else if (end instanceof Date) {
        endDate = end;
      }

      if (!startDate || !endDate) {
        return null; // Invalid date conversion
      }

      // Check if times are 0:00 (not set)
      if (isTimeNotSet(startDate) || isTimeNotSet(endDate)) {
        return null; // Times are not set (0:00)
      }

      // Format times
      const startTime = formatTime(startDate);
      const endTime = formatTime(endDate);

      return { start: startTime, end: endTime };
    };

    schedule.monday = getDaySchedule('monday');
    schedule.tuesday = getDaySchedule('tuesday');
    schedule.wednesday = getDaySchedule('wednesday');
    schedule.thursday = getDaySchedule('thursday');
    schedule.friday = getDaySchedule('friday');
    schedule.saturday = getDaySchedule('saturday');
    schedule.sunday = getDaySchedule('sunday');

    return schedule;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    if (!doctorUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [allAppointments, upcoming, doctorData] = await Promise.all([
        getDoctorAppointments(doctorUserId),
        getUpcomingAppointments(doctorUserId, 5),
        getDoctorDataByUserId(doctorUserId),
      ]);

      setAppointments(allAppointments);
      setUpcomingAppointments(upcoming);

      const withPatients = await getAppointmentsWithPatients(doctorUserId);
      setAppointmentsWithPatients(withPatients);

      // Parse and set availability schedule
      if (doctorData?.time_slots) {
        const schedule = parseTimeSlots(doctorData.time_slots as DoctorTimeSlots, doctorData.enabled_days);
        setAvailabilitySchedule(schedule);
      } else {
        setAvailabilitySchedule({});
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [doctorUserId, parseTimeSlots]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const toDate = (date: Timestamp | Date | undefined): Date => {
    if (!date) return new Date(0);
    if (date instanceof Timestamp) return date.toDate();
    if (date instanceof Date) return date;
    return new Date(0);
  };

  const getPatientId = (userPatientID: string | { id?: string; path?: string } | null | undefined): string | null => {
    if (!userPatientID) return null;
    if (typeof userPatientID === "string") {
      return userPatientID;
    }
    if (userPatientID && typeof userPatientID === "object" && "id" in userPatientID) {
      return userPatientID.id || null;
    }
    if (userPatientID && typeof userPatientID === "object" && "path" in userPatientID) {
      const path = userPatientID.path;
      if (!path) return null;
      const parts = path.split("/");
      return parts[parts.length - 1] || null;
    }
    return null;
  };

  const statistics = useMemo<DashboardStatistics>(() => {
    const now = new Date();

    const uniquePatients = new Set<string>();
    appointments.forEach((apt) => {
      const patientId = getPatientId(apt.UserPatientID);
      if (patientId) {
        uniquePatients.add(patientId);
      }
    });

    const totalAppointments = appointments.length;
    const onlineConsultations = appointments.filter(
      (apt) => apt.appointmentType === "video" || apt.isVideoCall
    ).length;
    const cancelledAppointments = appointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;
    const videoConsultations = appointments.filter(
      (apt) => apt.appointmentType === "video" || apt.isVideoCall
    ).length;
    const completed = appointments.filter((apt) => apt.status === "completed" || apt.status === "checked-out").length;
    const pending = appointments.filter((apt) => apt.status === "pending").length;
    const confirmed = appointments.filter((apt) => apt.status === "confirmed").length;
    const cancelled = appointments.filter((apt) => apt.status === "cancelled").length;
    const totalPatients = uniquePatients.size;

    // Upcoming appointments (future dates)
    const upcoming = appointments.filter((apt) => {
      const aptDate = toDate(apt.appointmentDate);
      return aptDate > now;
    }).length;

    const preVisitBookings = appointments.filter((apt) => {
      const aptDate = toDate(apt.appointmentDate);
      return aptDate > now;
    }).length;

    return {
      totalAppointments,
      onlineConsultations,
      cancelledAppointments,
      totalPatients,
      videoConsultations,
      rescheduled: 0,
      preVisitBookings,
      walkinBookings: 0,
      followUps: 0,
      completed,
      pending,
      cancelled,
      upcoming,
      confirmed,
    };
  }, [appointments]);

  const trends = useMemo<DashboardTrends>(() => {
    const now = new Date();
    const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7DaysStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previous7DaysEnd = last7DaysStart;

    const calculateTrend = (
      last7DaysCount: number,
      previous7DaysCount: number
    ): TrendData => {
      let percentage = 0;
      
      if (previous7DaysCount === 0) {
        percentage = last7DaysCount > 0 ? 100 : 0;
      } else {
        percentage = ((last7DaysCount - previous7DaysCount) / previous7DaysCount) * 100;
      }

      const isPositive = percentage >= 0;
      const formatted = `${isPositive ? "+" : ""}${Math.round(percentage)}%`;
      
      return {
        percentage,
        isPositive,
        formatted,
        icon: isPositive ? "arrow-up" : "arrow-down",
        color: isPositive ? "success" : "danger",
        badgeColor: isPositive ? "success" : "danger",
      };
    };

    const last7DaysAppointments = appointments.filter((apt) => {
      const aptDate = toDate(apt.appointmentDate);
      return aptDate >= last7DaysStart && aptDate <= now;
    });

    const previous7DaysAppointments = appointments.filter((apt) => {
      const aptDate = toDate(apt.appointmentDate);
      return aptDate >= previous7DaysStart && aptDate < previous7DaysEnd;
    });

    const last7DaysTotal = last7DaysAppointments.length;
    const previous7DaysTotal = previous7DaysAppointments.length;

    const last7DaysOnline = last7DaysAppointments.filter(
      (apt) => apt.appointmentType === "video" || apt.isVideoCall
    ).length;
    const previous7DaysOnline = previous7DaysAppointments.filter(
      (apt) => apt.appointmentType === "video" || apt.isVideoCall
    ).length;

    const last7DaysCancelled = last7DaysAppointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;
    const previous7DaysCancelled = previous7DaysAppointments.filter(
      (apt) => apt.status === "cancelled"
    ).length;

    const last7DaysCompleted = last7DaysAppointments.filter(
      (apt) => apt.status === "completed" || apt.status === "checked-out"
    ).length;
    const previous7DaysCompleted = previous7DaysAppointments.filter(
      (apt) => apt.status === "completed" || apt.status === "checked-out"
    ).length;

    const last7DaysPatientIds = new Set<string>();
    last7DaysAppointments.forEach((apt) => {
      const patientId = getPatientId(apt.UserPatientID);
      if (patientId) {
        last7DaysPatientIds.add(patientId);
      }
    });
    const last7DaysTotalPatients = last7DaysPatientIds.size;

    const previous7DaysPatientIds = new Set<string>();
    previous7DaysAppointments.forEach((apt) => {
      const patientId = getPatientId(apt.UserPatientID);
      if (patientId) {
        previous7DaysPatientIds.add(patientId);
      }
    });
    const previous7DaysTotalPatients = previous7DaysPatientIds.size;

    const last7DaysPreVisit = last7DaysAppointments.filter((apt) => {
      const aptDate = toDate(apt.appointmentDate);
      return aptDate > now;
    }).length;
    const previous7DaysPreVisit = previous7DaysAppointments.filter((apt) => {
      const aptDate = toDate(apt.appointmentDate);
      const previousNow = new Date(previous7DaysEnd.getTime() - 1);
      return aptDate > previousNow;
    }).length;

    const last7DaysUpcoming = last7DaysAppointments.filter((apt) => {
      const aptDate = toDate(apt.appointmentDate);
      return aptDate > now;
    }).length;
    const previous7DaysUpcoming = previous7DaysAppointments.filter((apt) => {
      const aptDate = toDate(apt.appointmentDate);
      const previousNow = new Date(previous7DaysEnd.getTime() - 1);
      return aptDate > previousNow;
    }).length;

    const last7DaysConfirmed = last7DaysAppointments.filter(
      (apt) => apt.status === "confirmed"
    ).length;
    const previous7DaysConfirmed = previous7DaysAppointments.filter(
      (apt) => apt.status === "confirmed"
    ).length;
        
    return {
      totalAppointmentsTrend: calculateTrend(last7DaysTotal, previous7DaysTotal),
      onlineConsultationsTrend: calculateTrend(last7DaysOnline, previous7DaysOnline),
      cancelledTrend: calculateTrend(last7DaysCancelled, previous7DaysCancelled),
      completedTrend: calculateTrend(last7DaysCompleted, previous7DaysCompleted),
      totalPatientsTrend: calculateTrend(last7DaysTotalPatients, previous7DaysTotalPatients),
      videoConsultationsTrend: calculateTrend(last7DaysOnline, previous7DaysOnline),
      rescheduledTrend: calculateTrend(0, 0),
      preVisitBookingsTrend: calculateTrend(last7DaysPreVisit, previous7DaysPreVisit),
      walkinBookingsTrend: calculateTrend(0, 0),
      followUpsTrend: calculateTrend(0, 0),
      upcomingTrend: calculateTrend(last7DaysUpcoming, previous7DaysUpcoming),
      confirmedTrend: calculateTrend(last7DaysConfirmed, previous7DaysConfirmed),
    };
  }, [appointments]);

  return {
    appointments,
    upcomingAppointments,
    appointmentsWithPatients,
    statistics,
    trends,
    availabilitySchedule,
    loading,
    error,
    refresh: fetchDashboardData,
  };
};

