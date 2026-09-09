import type { Timestamp } from "firebase/firestore";

export type PrescriptionStatus = "active" | "completed" | "cancelled";

export interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
}

/** `Prescription/{id}` document shape. */
export interface Prescription {
  _id: string;
  prescriptionId: string;
  appointmentId: string | null;
  doctorId: string;
  doctorUserId: string;
  patientId: string;
  patientUserId: string | null;
  patientNameLower: string;
  patientName: string | null;
  doctorName: string | null;
  prescribedOn: Timestamp | Date | null;
  diagnosis: string | null;
  notes: string | null;
  followUpDate: Timestamp | Date | null;
  medicines: Medicine[];
  status: PrescriptionStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface PrescriptionFormValues {
  appointmentId: string;
  patientId: string;
  diagnosis: string;
  notes: string;
  followUpDate: string;
  medicines: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
  }>;
  status: PrescriptionStatus;
}

export interface ListPrescriptionsParams {
  search?: string;
  status?: PrescriptionStatus;
  doctorUserId?: string;
  patientUserId?: string;
  patientId?: string;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListPrescriptionsResult {
  prescriptions: Prescription[];
  nextCursor: string | null;
}
