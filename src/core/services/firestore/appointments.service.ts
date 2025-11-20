import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  limit,
  Timestamp,
  DocumentReference,
  doc,
  serverTimestamp,
} from "firebase/firestore";
// @ts-expect-error - Firebase config file (JS file, no types)
import { db } from "../../../firebase";
import { isHoliday } from "./doctor.service";

// Appointment interface matching Firestore schema
export interface FirestoreAppointment {
  _id?: string;
  AppointmentId: string;
  Complain?: string;
  DoctorsName?: string;
  UserPatientID: DocumentReference | string;
  appointmentDate: Timestamp | Date;
  appointmentTime: Timestamp | Date;
  appointmentType: "physical" | "video";
  appointmentfile?: string;
  cancel_reason?: string;
  created?: Timestamp | Date;
  description?: string;
  diagnosis?: string;
  doctorId: DocumentReference | string;
  doctorUserId: DocumentReference | string;
  isVideoCall?: boolean;
  patientsEmail?: string;
  patientsName?: string;
  patientsNumber?: string;
  payment_option?: string;
  payment_status?: string;
  price?: number;
  status: "pending" | "completed" | "cancelled" | "confirmed" | "checked-in" | "checked-out" | "rescheduled";
  urgency?: string;
  video_link?: string;
}

// User interface for patient data
export interface PatientData {
  uid: string;
  display_name: string;
  email: string;
  phone_number: string;
  photo_url?: string;
}

/**
 * Fetch appointments for a specific doctor
 * @param doctorUserId - The doctor's user ID (uid from Users collection) or DocumentReference path
 * @param limitCount - Optional limit for number of appointments
 * @returns Array of appointments
 */
export const getDoctorAppointments = async (
  doctorUserId: string,
  limitCount?: number
): Promise<FirestoreAppointment[]> => {
  try {
    const appointmentsRef = collection(db, "Appointment");
    
    // Create DocumentReference from the doctorUserId
    const doctorUserRef = doc(db, "Users", doctorUserId);
    
    // Query without orderBy to avoid composite index requirement
    let q = query(
      appointmentsRef,
      where("doctorUserId", "==", doctorUserRef)
    );

    if (limitCount) {
      q = query(q, limit(limitCount));
    }

    const querySnapshot = await getDocs(q);
    const appointments: FirestoreAppointment[] = [];

    querySnapshot.forEach((docSnapshot) => {
      appointments.push({
        _id: docSnapshot.id,
        ...docSnapshot.data(),
      } as FirestoreAppointment);
    });

    // Sort by appointmentDate in memory (descending - most recent first)
    appointments.sort((a, b) => {
      const dateA = a.appointmentDate instanceof Timestamp 
        ? a.appointmentDate.toMillis() 
        : a.appointmentDate instanceof Date 
        ? a.appointmentDate.getTime() 
        : 0;
      const dateB = b.appointmentDate instanceof Timestamp 
        ? b.appointmentDate.toMillis() 
        : b.appointmentDate instanceof Date 
        ? b.appointmentDate.getTime() 
        : 0;
      return dateB - dateA; // Descending order
    });

    return appointments;
  } catch (error) {
    console.error("Error fetching doctor appointments:", error);
    throw error;
  }
};

/**
 * Fetch upcoming appointments (future appointments)
 * @param doctorUserId - The doctor's user ID (uid from Users collection) or DocumentReference path
 * @param limitCount - Optional limit
 * @returns Array of upcoming appointments
 */
export const getUpcomingAppointments = async (
  doctorUserId: string,
  limitCount: number = 5
): Promise<FirestoreAppointment[]> => {
  try {
    const now = Timestamp.now();
    const appointmentsRef = collection(db, "Appointment");
    
    const doctorUserRef = doc(db, "Users", doctorUserId);
    
    const q = query(
      appointmentsRef,
      where("doctorUserId", "==", doctorUserRef)
    );

    const querySnapshot = await getDocs(q);
    const appointments: FirestoreAppointment[] = [];

    querySnapshot.forEach((docSnapshot) => {
      appointments.push({
        _id: docSnapshot.id,
        ...docSnapshot.data(),
      } as FirestoreAppointment);
    });

    // Filter and sort in memory
    const upcoming = appointments
      .filter((apt) => {
        const aptDate = apt.appointmentDate instanceof Timestamp 
          ? apt.appointmentDate 
          : apt.appointmentDate instanceof Date 
          ? Timestamp.fromDate(apt.appointmentDate)
          : null;
        
        if (!aptDate) return false;
        
        const isFuture = aptDate.toMillis() >= now.toMillis();
        const isPendingOrConfirmed = apt.status === "pending" || apt.status === "confirmed";
        
        return isFuture && isPendingOrConfirmed;
      })
      .sort((a, b) => {
        const dateA = a.appointmentDate instanceof Timestamp 
          ? a.appointmentDate.toMillis() 
          : a.appointmentDate instanceof Date 
          ? a.appointmentDate.getTime() 
          : 0;
        const dateB = b.appointmentDate instanceof Timestamp 
          ? b.appointmentDate.toMillis() 
          : b.appointmentDate instanceof Date 
          ? b.appointmentDate.getTime() 
          : 0;
        return dateA - dateB; // Ascending order
      })
      .slice(0, limitCount);

    return upcoming;
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    throw error;
  }
};

/**
 * Fetch patient data from Users collection
 * @param patientRef - DocumentReference or user ID
 * @returns Patient data
 */
export const getPatientData = async (
  patientRef: DocumentReference | string
): Promise<PatientData | null> => {
  try {
    let userDoc;
    if (typeof patientRef === "string") {
      const usersRef = collection(db, "Users");
      const userQuery = query(usersRef, where("uid", "==", patientRef));
      const querySnapshot = await getDocs(userQuery);
      if (querySnapshot.empty) return null;
      userDoc = querySnapshot.docs[0];
    } else {
      userDoc = await getDoc(patientRef);
      if (!userDoc.exists()) return null;
    }

    return userDoc.data() as PatientData;
  } catch (error) {
    console.error("Error fetching patient data:", error);
    return null;
  }
};

/**
 * Get appointments with patient data
 * @param doctorUserId - The doctor's user ID
 * @returns Array of appointments with patient information
 */
export const getAppointmentsWithPatients = async (
  doctorUserId: string
): Promise<(FirestoreAppointment & { patient?: PatientData })[]> => {
  try {
    const appointments = await getDoctorAppointments(doctorUserId);
    const appointmentsWithPatients = await Promise.all(
      appointments.map(async (appointment) => {
        let patient: PatientData | null = null;
        
        if (appointment.UserPatientID) {
          if (typeof appointment.UserPatientID === "string") {
            patient = await getPatientData(appointment.UserPatientID);
          } else {
            patient = await getPatientData(appointment.UserPatientID);
          }
        }

        return {
          ...appointment,
          patient: patient || undefined,
        };
      })
    );

    return appointmentsWithPatients;
  } catch (error) {
    console.error("Error fetching appointments with patients:", error);
    throw error;
  }
};

/**
 * Create a new appointment
 */
export const createAppointment = async (
  doctorUserId: string,
  doctorId: string,
  appointmentData: Omit<FirestoreAppointment, "_id" | "doctorUserId" | "doctorId" | "created">
): Promise<string> => {
  try {
    // Check if the appointment date is a holiday
    const appointmentDate = appointmentData.appointmentDate instanceof Date
      ? Timestamp.fromDate(appointmentData.appointmentDate)
      : appointmentData.appointmentDate instanceof Timestamp
      ? appointmentData.appointmentDate
      : Timestamp.now();
    
    const isDateHoliday = await isHoliday(doctorUserId, appointmentDate);
    if (isDateHoliday) {
      throw new Error("Cannot create appointment on a holiday. Please select a different date.");
    }

    const appointmentsRef = collection(db, "Appointment");
    
    const doctorUserRef = doc(db, "Users", doctorUserId);
    const doctorRef = doc(db, "Doctor", doctorId);
    
    let patientRef: DocumentReference;
    if (typeof appointmentData.UserPatientID === "string") {
      patientRef = doc(db, "Users", appointmentData.UserPatientID);
    } else {
      patientRef = appointmentData.UserPatientID as DocumentReference;
    }
    
    const appointmentTime = appointmentData.appointmentTime instanceof Date
      ? Timestamp.fromDate(appointmentData.appointmentTime)
      : appointmentData.appointmentTime instanceof Timestamp
      ? appointmentData.appointmentTime
      : Timestamp.now();

    const appointmentId = appointmentData.AppointmentId || 
      `APT${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const newAppointment = {
      ...appointmentData,
      AppointmentId: appointmentId,
      UserPatientID: patientRef,
      doctorUserId: doctorUserRef,
      doctorId: doctorRef,
      appointmentDate,
      appointmentTime,
      created: serverTimestamp(),
    };

    const docRef = await addDoc(appointmentsRef, newAppointment);
    return docRef.id;
  } catch (error) {
    console.error("Error creating appointment:", error);
    throw error;
  }
};

/**
 * Update an existing appointment
 */
export const updateAppointment = async (
  appointmentId: string,
  appointmentData: Partial<Omit<FirestoreAppointment, "_id" | "doctorUserId" | "doctorId">>,
  doctorUserId?: string
): Promise<void> => {
  try {
    const appointmentRef = doc(db, "Appointment", appointmentId);
    
    const updateData: Partial<FirestoreAppointment> = { ...appointmentData };
    
    // If appointment date is being updated, check if it's a holiday
    if (updateData.appointmentDate && doctorUserId) {
      const newAppointmentDate = updateData.appointmentDate instanceof Date
        ? Timestamp.fromDate(updateData.appointmentDate)
        : updateData.appointmentDate instanceof Timestamp
        ? updateData.appointmentDate
        : null;
      
      if (newAppointmentDate) {
        const isDateHoliday = await isHoliday(doctorUserId, newAppointmentDate);
        if (isDateHoliday) {
          throw new Error("Cannot reschedule appointment to a holiday. Please select a different date.");
        }
      }
    }
    
    if (updateData.appointmentDate instanceof Date) {
      updateData.appointmentDate = Timestamp.fromDate(updateData.appointmentDate);
    }
    if (updateData.appointmentTime instanceof Date) {
      updateData.appointmentTime = Timestamp.fromDate(updateData.appointmentTime);
    }
    
    if (updateData.UserPatientID) {
      if (typeof updateData.UserPatientID === "string") {
        updateData.UserPatientID = doc(db, "Users", updateData.UserPatientID);
      }
    }

    await updateDoc(appointmentRef, updateData);
  } catch (error) {
    console.error("Error updating appointment:", error);
    throw error;
  }
};

/**
 * Delete an appointment
 */
export const deleteAppointment = async (appointmentId: string): Promise<void> => {
  try {
    const appointmentRef = doc(db, "Appointment", appointmentId);
    await deleteDoc(appointmentRef);
  } catch (error) {
    console.error("Error deleting appointment:", error);
    throw error;
  }
};

/**
 * Get a single appointment by ID
 */
export const getAppointmentById = async (
  appointmentId: string
): Promise<FirestoreAppointment | null> => {
  try {
    const appointmentRef = doc(db, "Appointment", appointmentId);
    const appointmentDoc = await getDoc(appointmentRef);
    
    if (!appointmentDoc.exists()) {
      return null;
    }
    
    return {
      _id: appointmentDoc.id,
      ...appointmentDoc.data(),
    } as FirestoreAppointment;
  } catch (error) {
    console.error("Error fetching appointment:", error);
    throw error;
  }
};

