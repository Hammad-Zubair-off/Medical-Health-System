import { useState, useCallback, useMemo, useEffect } from "react";
import type { Appointment, FilterValues } from "../appointment-types";
import {
  getAppointmentsWithPatients,
  createAppointment as createAppointmentService,
  updateAppointment as updateAppointmentService,
  deleteAppointment as deleteAppointmentService,
  getAppointmentById as getAppointmentByIdService,
  type FirestoreAppointment,
} from "../../../../../../core/services/firestore/appointments.service";
import { useUser } from "../../../../../../core/context/UserContext";
import { Timestamp } from "firebase/firestore";

export interface UseAppointmentsReturn {
  appointments: Appointment[];
  filteredAppointments: Appointment[];
  loading: boolean;
  error: string | null;
  createAppointment: (appointment: Omit<Appointment, "id">) => Promise<void>;
  updateAppointment: (id: string, appointment: Partial<Appointment>) => Promise<void>;
  updateAppointmentStatus: (id: string, status: string) => Promise<void>;
  rescheduleAppointment: (id: string, newDate: Date, newTime: Date) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  getAppointmentById: (id: string) => Appointment | undefined;
  applyFilters: (filters: FilterValues) => void;
  applySort: (sortBy: string) => void;
  currentFilters: FilterValues;
  currentSort: string;
}

// Helper to convert Firestore appointment to UI Appointment format
const convertFirestoreToAppointment = (
  firestoreAppt: FirestoreAppointment & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } }
): Appointment => {
  // Format date and time
  const formatDateTime = (date: Timestamp | Date | undefined): string => {
    if (!date) return "N/A";
    const dateObj = date instanceof Timestamp ? date.toDate() : date;
    return dateObj.toLocaleString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const patientName = firestoreAppt.patientsName || firestoreAppt.patient?.display_name || "Unknown Patient";
  const patientPhone = firestoreAppt.patientsNumber || firestoreAppt.patient?.phone_number || "N/A";
  const patientImage = firestoreAppt.patient?.photo_url || null;
  const mode = firestoreAppt.appointmentType === "video" || firestoreAppt.isVideoCall ? "Online" : "Offline";
  
  // Map Firestore status to UI status (capitalize first letter)
  const firestoreStatus = firestoreAppt.status || "pending";
  const status = firestoreStatus.charAt(0).toUpperCase() + firestoreStatus.slice(1);

  return {
    id: firestoreAppt._id || "",
    AppointmentId: firestoreAppt.AppointmentId || "",
    Date_Time: formatDateTime(firestoreAppt.appointmentDate),
    Patient: patientName,
    img: patientImage || undefined,
    phone_number: patientPhone,
    Mode: mode,
    Status: status,
    _firestoreData: firestoreAppt as FirestoreAppointment & { patient?: { uid: string; display_name: string; email: string; phone_number: string; photo_url?: string } },
  };
};

export const useAppointments = (): UseAppointmentsReturn => {
  const { doctorUserId } = useUser();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<FilterValues>({});
  const [currentSort, setCurrentSort] = useState<string>("recent");

  // Fetch appointments from Firestore
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!doctorUserId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const appointmentsWithPatients = await getAppointmentsWithPatients(doctorUserId);
        const convertedAppointments = appointmentsWithPatients.map(convertFirestoreToAppointment);
        setAppointments(convertedAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError(err instanceof Error ? err.message : "Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [doctorUserId]);

  // Create appointment
  const createAppointment = useCallback(
    async (appointmentData: Omit<Appointment, "id">) => {
      if (!doctorUserId) {
        throw new Error("Doctor user ID is required");
      }

      setLoading(true);
      setError(null);
      try {
        const doctorId = "rg7yL0esOEBVsv1Lh9mt";
        
        const firestoreData: Omit<FirestoreAppointment, "_id" | "doctorUserId" | "doctorId" | "created"> = {
          AppointmentId: appointmentData.AppointmentId || "",
          appointmentDate: new Date(appointmentData.Date_Time),
          appointmentTime: new Date(appointmentData.Date_Time),
          appointmentType: appointmentData.Mode === "Online" ? "video" : "physical",
          isVideoCall: appointmentData.Mode === "Online",
          patientsName: appointmentData.Patient,
          patientsNumber: appointmentData.phone_number,
          status: (appointmentData.Status.toLowerCase() as FirestoreAppointment["status"]) || "pending",
          UserPatientID: "",
        };

        const docId = await createAppointmentService(doctorUserId, doctorId, firestoreData);
        
        const createdAppt = await getAppointmentByIdService(docId);
        if (createdAppt) {
          const appointmentsWithPatients = await getAppointmentsWithPatients(doctorUserId);
          const convertedAppointments = appointmentsWithPatients.map(convertFirestoreToAppointment);
          setAppointments(convertedAppointments);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create appointment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [doctorUserId]
  );

  // Update appointment
  const updateAppointment = useCallback(
    async (id: string, appointmentData: Partial<Appointment>) => {
      if (!doctorUserId) {
        throw new Error("Doctor user ID is required");
      }

      setLoading(true);
      setError(null);
      try {
        const firestoreUpdate: Partial<FirestoreAppointment> = {};
        
        if (appointmentData.Date_Time) {
          const date = new Date(appointmentData.Date_Time);
          firestoreUpdate.appointmentDate = date;
          firestoreUpdate.appointmentTime = date;
        }
        if (appointmentData.Patient) {
          firestoreUpdate.patientsName = appointmentData.Patient;
        }
        if (appointmentData.phone_number) {
          firestoreUpdate.patientsNumber = appointmentData.phone_number;
        }
        if (appointmentData.Mode) {
          firestoreUpdate.appointmentType = appointmentData.Mode === "Online" ? "video" : "physical";
          firestoreUpdate.isVideoCall = appointmentData.Mode === "Online";
        }
        if (appointmentData.Status) {
          firestoreUpdate.status = (appointmentData.Status.toLowerCase() as FirestoreAppointment["status"]) || "pending";
        }

        await updateAppointmentService(id, firestoreUpdate, doctorUserId);
        
        const appointmentsWithPatients = await getAppointmentsWithPatients(doctorUserId);
        const convertedAppointments = appointmentsWithPatients.map(convertFirestoreToAppointment);
        setAppointments(convertedAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update appointment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [doctorUserId]
  );

  // Update appointment status
  const updateAppointmentStatus = useCallback(
    async (id: string, status: string) => {
      if (!doctorUserId) {
        throw new Error("Doctor user ID is required");
      }

      setLoading(true);
      setError(null);
      try {
        const statusMap: Record<string, FirestoreAppointment["status"]> = {
          "accept": "confirmed",
          "accepted": "confirmed",
          "confirm": "confirmed",
          "confirmed": "confirmed",
          "cancel": "cancelled",
          "cancelled": "cancelled",
          "complete": "completed",
          "completed": "completed",
          "pending": "pending",
          "reschedule": "rescheduled",
          "rescheduled": "rescheduled",
        };

        const firestoreStatus = statusMap[status.toLowerCase()] || "pending";

        await updateAppointmentService(id, { status: firestoreStatus });
        
        const appointmentsWithPatients = await getAppointmentsWithPatients(doctorUserId);
        const convertedAppointments = appointmentsWithPatients.map(convertFirestoreToAppointment);
        setAppointments(convertedAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update appointment status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [doctorUserId]
  );

  // Reschedule appointment
  const rescheduleAppointment = useCallback(
    async (id: string, newDate: Date, newTime: Date) => {
      if (!doctorUserId) {
        throw new Error("Doctor user ID is required");
      }

      setLoading(true);
      setError(null);
      try {
        await updateAppointmentService(id, {
          appointmentDate: newDate,
          appointmentTime: newTime,
          status: "rescheduled",
        }, doctorUserId);
        
        const appointmentsWithPatients = await getAppointmentsWithPatients(doctorUserId);
        const convertedAppointments = appointmentsWithPatients.map(convertFirestoreToAppointment);
        setAppointments(convertedAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reschedule appointment");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [doctorUserId]
  );

  // Delete appointment
  const deleteAppointment = useCallback(async (id: string) => {
    if (!doctorUserId) {
      throw new Error("Doctor user ID is required");
    }

    setLoading(true);
    setError(null);
    try {
      await deleteAppointmentService(id);
      
      const appointmentsWithPatients = await getAppointmentsWithPatients(doctorUserId);
      const convertedAppointments = appointmentsWithPatients.map(convertFirestoreToAppointment);
      setAppointments(convertedAppointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete appointment");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [doctorUserId]);

  // Get appointment by ID
  const getAppointmentById = useCallback(
    (id: string) => {
      return appointments.find((apt) => apt.id === id);
    },
    [appointments]
  );

  // Apply filters
  const applyFilters = useCallback((filters: FilterValues) => {
    setCurrentFilters(filters);
  }, []);

  // Apply sort
  const applySort = useCallback((sortBy: string) => {
    setCurrentSort(sortBy);
  }, []);

  // Filter and sort appointments
  const filteredAppointments = useMemo(() => {
    let filtered = [...appointments];

    // Apply filters
    if (currentFilters.statuses && currentFilters.statuses.length > 0) {
      filtered = filtered.filter((apt) =>
        currentFilters.statuses?.includes(apt.Status)
      );
    }
    if (currentFilters.date) {
      filtered = filtered.filter((apt) => {
        const aptDateStr = apt.Date_Time.toLowerCase();
        const filterDateStr = currentFilters.date!.toLowerCase();
        return aptDateStr.includes(filterDateStr);
      });
    }

    // Helper to parse Date_Time string to Date for sorting
    const parseDate = (dateTimeStr: string): Date => {
      try {
        return new Date(dateTimeStr);
      } catch {
        return new Date(0);
      }
    };

    // Apply sorting
    switch (currentSort) {
      case "recent":
        filtered.sort((a, b) => {
          const dateA = parseDate(a.Date_Time);
          const dateB = parseDate(b.Date_Time);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "ascending":
        filtered.sort((a, b) => {
          const dateA = parseDate(a.Date_Time);
          const dateB = parseDate(b.Date_Time);
          return dateA.getTime() - dateB.getTime();
        });
        break;
      case "descending":
        filtered.sort((a, b) => {
          const dateA = parseDate(a.Date_Time);
          const dateB = parseDate(b.Date_Time);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      case "lastMonth": {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        filtered = filtered.filter((apt) => {
          const aptDate = parseDate(apt.Date_Time);
          return aptDate >= lastMonth && !isNaN(aptDate.getTime());
        });
        filtered.sort((a, b) => {
          const dateA = parseDate(a.Date_Time);
          const dateB = parseDate(b.Date_Time);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      }
      case "last7Days": {
        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        filtered = filtered.filter((apt) => {
          const aptDate = parseDate(apt.Date_Time);
          return aptDate >= last7Days && !isNaN(aptDate.getTime());
        });
        filtered.sort((a, b) => {
          const dateA = parseDate(a.Date_Time);
          const dateB = parseDate(b.Date_Time);
          return dateB.getTime() - dateA.getTime();
        });
        break;
      }
      default:
        break;
    }

    return filtered;
  }, [appointments, currentFilters, currentSort]);

  return {
    appointments,
    filteredAppointments,
    loading,
    error,
    createAppointment,
    updateAppointment,
    updateAppointmentStatus,
    rescheduleAppointment,
    deleteAppointment,
    getAppointmentById,
    applyFilters,
    applySort,
    currentFilters,
    currentSort,
  };
};

