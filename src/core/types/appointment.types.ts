import type { DocumentReference, Timestamp } from "firebase/firestore";

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "checked-in"
  | "checked-out"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type AppointmentType = "physical" | "video";

/** `Appointment/{id}` document shape (legacy field names preserved). */
export interface FirestoreAppointment {
  _id?: string;
  AppointmentId: string;
  /** Canonical clinical patient join — `Patient/{id}`. Required on new writes. */
  patientId?: string | null;
  /** `Users/{uid}` when the patient can log in; null for walk-ins. */
  UserPatientID?: DocumentReference | string | null;
  Complain?: string;
  DoctorsName?: string;
  appointmentDate: Timestamp | Date;
  appointmentTime: Timestamp | Date;
  appointmentType: AppointmentType;
  appointmentfile?: string;
  cancel_reason?: string;
  created?: Timestamp | Date;
  createdBy?: string | null;
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
  status: AppointmentStatus;
  urgency?: string;
  video_link?: string;
  updated?: Timestamp | Date;
  updatedBy?: string | null;
}

/** Summary used on appointment cards (from Patient join, not Users). */
export interface AppointmentPatientSummary {
  uid: string;
  display_name: string;
  email: string;
  phone_number: string;
  photo_url?: string;
  patientDocId?: string;
}

export interface AppointmentFormValues {
  patientId: string;
  doctorId: string;
  doctorUserId: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  complain?: string;
  description?: string;
  doctorsName?: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  doctorUserId: string;
  doctorId: string;
  appointmentDate: Date | Timestamp;
  appointmentTime?: Date | Timestamp;
  appointmentType: AppointmentType;
  status?: AppointmentStatus;
  AppointmentId?: string;
  Complain?: string;
  description?: string;
  diagnosis?: string;
  DoctorsName?: string;
  patientsName?: string;
  patientsNumber?: string;
  patientsEmail?: string;
  price?: number;
  isVideoCall?: boolean;
}

export interface ListAppointmentsParams {
  status?: AppointmentStatus;
  doctorId?: string;
  doctorUserId?: string;
  patientId?: string;
  from?: Date | Timestamp;
  to?: Date | Timestamp;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListAppointmentsResult {
  appointments: FirestoreAppointment[];
  nextCursor: string | null;
}
