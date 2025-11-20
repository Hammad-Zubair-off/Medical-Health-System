import type { FirestoreAppointment, PatientData } from "../../../../../../core/services/firestore/appointments.service";

// Extended Appointment interface that works with both Firestore and UI
export interface Appointment {
  id: string; // Firestore document ID (_id)
  AppointmentId: string; // Appointment ID from Firestore
  Date_Time: string; // Formatted date/time string for display
  Patient: string; // Patient name
  img?: string; // Patient image URL (from patient.photo_url)
  phone_number: string; // Patient phone number
  Mode: string; // "In-Person" or "Online"
  Status: string; // Appointment status
  // Additional Firestore fields
  _firestoreData?: FirestoreAppointment & { patient?: PatientData };
}

export interface FilterValues {
  doctors?: string[];
  designations?: string[];
  departments?: string[];
  date?: string;
  amounts?: string[];
  statuses?: string[];
}

