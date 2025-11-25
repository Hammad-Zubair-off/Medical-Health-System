import { collection, getDocs, query, where, Timestamp, doc, getDoc } from "firebase/firestore";
// @ts-expect-error - Firebase config file (JS file, no types)
import { db } from "../../../firebase";
import type { FirestoreAppointment } from "./appointments.service";
import type { DoctorData } from "./doctor.service";

export interface AdminStatistics {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  totalRevenue: number;
  doctorsTrend: number;
  patientsTrend: number;
  appointmentsTrend: number;
  revenueTrend: number;
}

export interface AppointmentStatistics {
  all: number;
  cancelled: number;
  rescheduled: number;
  completed: number;
}

export interface PopularDoctor {
  doctorId: string;
  doctorUserId: string;
  name: string;
  specialization: string;
  photoUrl?: string;
  bookings: number;
}

export interface TopDepartment {
  name: string;
  count: number;
  revenue: number;
}

export interface TopPatient {
  patientId: string;
  name: string;
  photoUrl?: string;
  totalPaid: number;
  appointmentsCount: number;
}

export interface RecentTransaction {
  id: string;
  type: string;
  invoiceId: string;
  amount: number;
  date: Date;
}

export interface AvailableDoctor {
  doctorId: string;
  doctorUserId: string;
  name: string;
  specialization: string;
  photoUrl?: string;
}

/**
 * Get all doctors count
 */
export const getAllDoctorsCount = async (): Promise<number> => {
  try {
    const doctorsRef = collection(db, "Doctor");
    const querySnapshot = await getDocs(doctorsRef);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching doctors count:", error);
    return 0;
  }
};

/**
 * Get all patients count (users with role 'patient' or all users if role doesn't exist)
 */
export const getAllPatientsCount = async (): Promise<number> => {
  try {
    const usersRef = collection(db, "Users");
    
    // Try to query by role first
    try {
      const q = query(usersRef, where("role", "==", "patient"));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.size > 0) {
        return querySnapshot.size;
      }
    } catch (roleError) {
      console.log("Role field query failed, trying alternative approach");
    }
    
    // If role query fails or returns 0, try to get all users and filter
    // Or count all users who are not doctors
    const allUsersSnapshot = await getDocs(usersRef);
    let patientCount = 0;
    
    allUsersSnapshot.forEach((doc) => {
      const userData = doc.data();
      // If role exists and is 'patient', count it
      // If role doesn't exist, check if user is not a doctor
      const role = userData.role || userData.Role || "";
      const isDoctor = userData.isDoctor || userData.is_doctor || role === "doctor" || role === "Doctor";
      
      if (role === "patient" || role === "Patient" || (!isDoctor && role !== "doctor" && role !== "Doctor" && role !== "admin" && role !== "Admin")) {
        patientCount++;
      }
    });
    
    console.log("👥 [Admin Service] Patients count:", patientCount);
    return patientCount;
  } catch (error) {
    console.error("Error fetching patients count:", error);
    return 0;
  }
};

/**
 * Get all appointments
 */
export const getAllAppointments = async (): Promise<FirestoreAppointment[]> => {
  try {
    const appointmentsRef = collection(db, "Appointment");
    const querySnapshot = await getDocs(appointmentsRef);
    const appointments: FirestoreAppointment[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      appointments.push({
        _id: docSnapshot.id,
        ...docSnapshot.data(),
      } as FirestoreAppointment);
    });
    
    return appointments;
  } catch (error) {
    console.error("Error fetching all appointments:", error);
    return [];
  }
};

/**
 * Get all doctors
 */
export const getAllDoctors = async (): Promise<DoctorData[]> => {
  try {
    const doctorsRef = collection(db, "Doctor");
    const querySnapshot = await getDocs(doctorsRef);
    const doctors: DoctorData[] = [];
    
    querySnapshot.forEach((docSnapshot) => {
      doctors.push({
        _id: docSnapshot.id,
        ...docSnapshot.data(),
      } as DoctorData);
    });
    
    return doctors;
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    return [];
  }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStatistics = async (): Promise<AdminStatistics> => {
  try {
    const now = new Date();
    const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7DaysStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const previous7DaysEnd = last7DaysStart;

    // Get all data
    const [doctors, patients, appointments] = await Promise.all([
      getAllDoctorsCount(),
      getAllPatientsCount(),
      getAllAppointments(),
    ]);

    console.log("📊 [Admin Service] Statistics calculation:", {
      doctors,
      patients,
      appointmentsCount: appointments.length,
    });

    // Calculate revenue (sum of all paid/completed appointments)
    // Check multiple possible payment status field names
    const revenueAppointments = appointments.filter((apt) => {
      const paymentStatus = apt.payment_status || (apt as Record<string, unknown>).paymentStatus || "";
      const status = apt.status || "";
      const hasPrice = apt.price && apt.price > 0;
      
      return (
        paymentStatus === "paid" || 
        status === "completed" || 
        status === "checked-out" ||
        (hasPrice && (status === "confirmed" || status === "pending"))
      );
    });
    
    const totalRevenue = revenueAppointments.reduce((sum, apt) => sum + (apt.price || 0), 0);
    
    console.log("💰 [Admin Service] Revenue calculation:", {
      totalAppointments: appointments.length,
      revenueAppointments: revenueAppointments.length,
      totalRevenue,
      sampleAppointment: appointments[0] ? {
        price: appointments[0].price,
        payment_status: appointments[0].payment_status,
        status: appointments[0].status,
      } : null,
    });

    // Calculate trends (last 7 days vs previous 7 days)
    const last7DaysAppointments = appointments.filter((apt) => {
      const aptDate = apt.appointmentDate instanceof Timestamp
        ? apt.appointmentDate.toDate()
        : apt.appointmentDate instanceof Date
        ? apt.appointmentDate
        : null;
      return aptDate && aptDate >= last7DaysStart;
    });

    const previous7DaysAppointments = appointments.filter((apt) => {
      const aptDate = apt.appointmentDate instanceof Timestamp
        ? apt.appointmentDate.toDate()
        : apt.appointmentDate instanceof Date
        ? apt.appointmentDate
        : null;
      return aptDate && aptDate >= previous7DaysStart && aptDate < previous7DaysEnd;
    });

    const appointmentsTrend = previous7DaysAppointments.length > 0
      ? ((last7DaysAppointments.length - previous7DaysAppointments.length) / previous7DaysAppointments.length) * 100
      : last7DaysAppointments.length > 0 ? 100 : 0;

    // For doctors and patients, we'll use a simple calculation
    // In a real scenario, you'd track creation dates
    const doctorsTrend = 95; // Placeholder - would need creation dates
    const patientsTrend = 25; // Placeholder - would need creation dates

    // Revenue trend
    const last7DaysRevenue = last7DaysAppointments
      .filter((apt) => apt.payment_status === "paid" || apt.status === "completed")
      .reduce((sum, apt) => sum + (apt.price || 0), 0);
    
    const previous7DaysRevenue = previous7DaysAppointments
      .filter((apt) => apt.payment_status === "paid" || apt.status === "completed")
      .reduce((sum, apt) => sum + (apt.price || 0), 0);

    const revenueTrend = previous7DaysRevenue > 0
      ? ((last7DaysRevenue - previous7DaysRevenue) / previous7DaysRevenue) * 100
      : last7DaysRevenue > 0 ? 100 : 0;

    return {
      totalDoctors: doctors,
      totalPatients: patients,
      totalAppointments: appointments.length,
      totalRevenue,
      doctorsTrend,
      patientsTrend,
      appointmentsTrend: Math.round(appointmentsTrend),
      revenueTrend: Math.round(revenueTrend),
    };
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    return {
      totalDoctors: 0,
      totalPatients: 0,
      totalAppointments: 0,
      totalRevenue: 0,
      doctorsTrend: 0,
      patientsTrend: 0,
      appointmentsTrend: 0,
      revenueTrend: 0,
    };
  }
};

/**
 * Get appointment statistics
 */
export const getAppointmentStatistics = async (): Promise<AppointmentStatistics> => {
  try {
    const appointments = await getAllAppointments();
    
    return {
      all: appointments.length,
      cancelled: appointments.filter((apt) => apt.status === "cancelled").length,
      rescheduled: appointments.filter((apt) => apt.status === "rescheduled").length,
      completed: appointments.filter((apt) => apt.status === "completed" || apt.status === "checked-out").length,
    };
  } catch (error) {
    console.error("Error fetching appointment statistics:", error);
    return {
      all: 0,
      cancelled: 0,
      rescheduled: 0,
      completed: 0,
    };
  }
};

/**
 * Get popular doctors (by appointment count)
 */
export const getPopularDoctors = async (limit: number = 3): Promise<PopularDoctor[]> => {
  try {
    const appointments = await getAllAppointments();
    const doctors = await getAllDoctors();
    const usersRef = collection(db, "Users");
    
    // Count appointments per doctor
    const doctorBookings = new Map<string, number>();
    
    appointments.forEach((apt) => {
      const doctorId = typeof apt.doctorId === "string" ? apt.doctorId : apt.doctorId?.id || "";
      if (doctorId) {
        doctorBookings.set(doctorId, (doctorBookings.get(doctorId) || 0) + 1);
      }
    });
    
    // Get doctor details and fetch names from Users collection
    const popularDoctors: PopularDoctor[] = [];
    
    for (const doctor of doctors) {
      const bookings = doctorBookings.get(doctor._id || "") || 0;
      if (bookings > 0) {
        let doctorName = (doctor.name as string) || "";
        let doctorPhotoUrl = doctor.photo_url as string | undefined;
        
        // Try to get doctor name from Users collection
        const doctorUserId = typeof doctor.userid === "string" 
          ? doctor.userid 
          : doctor.userid?.id || "";
        
        if (doctorUserId && !doctorName) {
          try {
            const userDocRef = doc(db, "Users", doctorUserId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              doctorName = userData.display_name || userData.name || userData.displayName || "";
              doctorPhotoUrl = doctorPhotoUrl || userData.photo_url || userData.photoUrl;
            }
          } catch (userError) {
            console.error(`Error fetching user data for doctor ${doctorUserId}:`, userError);
          }
        }
        
        // Fallback to DoctorsName from appointments if available
        if (!doctorName) {
          const doctorAppointments = appointments.filter((apt) => {
            const aptDoctorId = typeof apt.doctorId === "string" ? apt.doctorId : apt.doctorId?.id || "";
            return aptDoctorId === doctor._id;
          });
          if (doctorAppointments.length > 0 && doctorAppointments[0].DoctorsName) {
            doctorName = doctorAppointments[0].DoctorsName;
          }
        }
        
        popularDoctors.push({
          doctorId: doctor._id || "",
          doctorUserId,
          name: doctorName || "Unknown Doctor",
          specialization: doctor.specialization || "General",
          photoUrl: doctorPhotoUrl,
          bookings,
        });
      }
    }
    
    // Sort by bookings (descending) and limit
    return popularDoctors
      .sort((a, b) => b.bookings - a.bookings)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching popular doctors:", error);
    return [];
  }
};

/**
 * Get top departments
 */
export const getTopDepartments = async (limit: number = 3): Promise<TopDepartment[]> => {
  try {
    const doctors = await getAllDoctors();
    const appointments = await getAllAppointments();
    
    // Group by specialization/department
    const departmentStats = new Map<string, { count: number; revenue: number }>();
    
    doctors.forEach((doctor) => {
      const dept = doctor.specialization || "General";
      if (!departmentStats.has(dept)) {
        departmentStats.set(dept, { count: 0, revenue: 0 });
      }
    });
    
    // Count appointments and revenue per department
    appointments.forEach((apt) => {
      const doctorId = typeof apt.doctorId === "string" ? apt.doctorId : apt.doctorId?.id || "";
      const doctor = doctors.find((d) => d._id === doctorId);
      if (doctor) {
        const dept = doctor.specialization || "General";
        const stats = departmentStats.get(dept);
        if (stats) {
          stats.count++;
          const paymentStatus = apt.payment_status || (apt as Record<string, unknown>).paymentStatus || "";
          const status = apt.status || "";
          if (paymentStatus === "paid" || status === "completed" || status === "checked-out") {
            stats.revenue += apt.price || 0;
          }
        }
      }
    });
    
    // Convert to array and sort
    const topDepartments: TopDepartment[] = Array.from(departmentStats.entries())
      .map(([name, stats]) => ({
        name,
        count: stats.count,
        revenue: stats.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return topDepartments;
  } catch (error) {
    console.error("Error fetching top departments:", error);
    return [];
  }
};

/**
 * Get top patients (by total paid)
 */
export const getTopPatients = async (limit: number = 5): Promise<TopPatient[]> => {
  try {
    const appointments = await getAllAppointments();
    const usersRef = collection(db, "Users");
    
    // Group appointments by patient
    const patientStats = new Map<string, { totalPaid: number; appointmentsCount: number }>();
    
    appointments.forEach((apt) => {
      const patientId = typeof apt.UserPatientID === "string" 
        ? apt.UserPatientID 
        : apt.UserPatientID?.id || "";
      
      if (patientId) {
        const stats = patientStats.get(patientId) || { totalPaid: 0, appointmentsCount: 0 };
        stats.appointmentsCount++;
        if (apt.payment_status === "paid" || apt.status === "completed") {
          stats.totalPaid += apt.price || 0;
        }
        patientStats.set(patientId, stats);
      }
    });
    
    // Fetch patient details
    const topPatients: TopPatient[] = [];
    
    for (const [patientId, stats] of Array.from(patientStats.entries())) {
      try {
        const userQuery = query(usersRef, where("uid", "==", patientId));
        const userSnapshot = await getDocs(userQuery);
        
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          topPatients.push({
            patientId,
            name: userData.display_name || "Unknown Patient",
            photoUrl: userData.photo_url,
            totalPaid: stats.totalPaid,
            appointmentsCount: stats.appointmentsCount,
          });
        }
      } catch (error) {
        console.error(`Error fetching patient ${patientId}:`, error);
      }
    }
    
    // Sort by total paid (descending) and limit
    return topPatients
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching top patients:", error);
    return [];
  }
};

/**
 * Get recent transactions
 */
export const getRecentTransactions = async (limit: number = 5): Promise<RecentTransaction[]> => {
  try {
    const appointments = await getAllAppointments();
    
    // Filter paid/completed appointments and convert to transactions
    const transactions: RecentTransaction[] = appointments
      .filter((apt) => apt.payment_status === "paid" || apt.status === "completed")
      .map((apt) => ({
        id: apt._id || "",
        type: apt.appointmentType === "video" ? "Online Consultation" : "General Check-up",
        invoiceId: `#INV${apt.AppointmentId?.slice(-4) || apt._id?.slice(-4) || "0000"}`,
        amount: apt.price || 0,
        date: apt.appointmentDate instanceof Timestamp
          ? apt.appointmentDate.toDate()
          : apt.appointmentDate instanceof Date
          ? apt.appointmentDate
          : new Date(),
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
    
    return transactions;
  } catch (error) {
    console.error("Error fetching recent transactions:", error);
    return [];
  }
};

/**
 * Get doctors schedule statistics
 */
export const getDoctorsScheduleStats = async (): Promise<{
  available: number;
  unavailable: number;
  leave: number;
}> => {
  try {
    const doctors = await getAllDoctors();
    
    let available = 0;
    let unavailable = 0;
    let leave = 0;
    
    doctors.forEach((doctor) => {
      const enabledDays = doctor.enabled_days;
      const hasEnabledDays = enabledDays && Object.values(enabledDays).some((val) => val === true);
      
      if (hasEnabledDays) {
        available++;
      } else {
        unavailable++;
      }
      // Leave count would need a separate leave management system
      // For now, we'll set it to 0 or calculate based on holidays
      if (doctor.holidays && doctor.holidays.length > 0) {
        const today = new Date();
        const hasActiveHoliday = doctor.holidays.some((holiday) => {
          const holidayDate = holiday.date instanceof Timestamp
            ? holiday.date.toDate()
            : holiday.date instanceof Date
            ? holiday.date
            : null;
          return holidayDate && holidayDate >= today;
        });
        if (hasActiveHoliday) {
          leave++;
        }
      }
    });
    
    return { available, unavailable, leave };
  } catch (error) {
    console.error("Error fetching doctors schedule stats:", error);
    return { available: 0, unavailable: 0, leave: 0 };
  }
};

/**
 * Get income by treatment/department
 */
export const getIncomeByTreatment = async (): Promise<Array<{
  name: string;
  appointments: number;
  revenue: number;
}>> => {
  try {
    const topDepartments = await getTopDepartments(10);
    return topDepartments.map((dept) => ({
      name: dept.name,
      appointments: dept.count,
      revenue: dept.revenue,
    }));
  } catch (error) {
    console.error("Error fetching income by treatment:", error);
    return [];
  }
};

/**
 * Get available doctors (doctors with enabled schedules)
 */
export const getAvailableDoctors = async (limit: number = 4): Promise<AvailableDoctor[]> => {
  try {
    const doctors = await getAllDoctors();
    const usersRef = collection(db, "Users");
    const availableDoctors: AvailableDoctor[] = [];
    
    for (const doctor of doctors) {
      // Check if doctor has enabled days
      const enabledDays = doctor.enabled_days;
      const hasEnabledDays = enabledDays && Object.values(enabledDays).some((val) => val === true);
      
      if (hasEnabledDays) {
        let doctorName = (doctor.name as string) || "";
        let doctorPhotoUrl = doctor.photo_url as string | undefined;
        
        // Try to get doctor name from Users collection
        const doctorUserId = typeof doctor.userid === "string" 
          ? doctor.userid 
          : doctor.userid?.id || "";
        
        if (doctorUserId && !doctorName) {
          try {
            const userDocRef = doc(db, "Users", doctorUserId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
              const userData = userDoc.data();
              doctorName = userData.display_name || userData.name || userData.displayName || "";
              doctorPhotoUrl = doctorPhotoUrl || userData.photo_url || userData.photoUrl;
            }
          } catch (userError) {
            console.error(`Error fetching user data for doctor ${doctorUserId}:`, userError);
          }
        }
        
        // Fallback to specialization if name still not found
        if (!doctorName) {
          doctorName = `Dr. ${doctor.specialization || "Unknown"}`;
        }
        
        availableDoctors.push({
          doctorId: doctor._id || "",
          doctorUserId,
          name: doctorName,
          specialization: doctor.specialization || "General",
          photoUrl: doctorPhotoUrl,
        });
        
        // Limit the results
        if (availableDoctors.length >= limit) {
          break;
        }
      }
    }
    
    return availableDoctors;
  } catch (error) {
    console.error("Error fetching available doctors:", error);
    return [];
  }
};

