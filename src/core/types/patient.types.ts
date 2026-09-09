import type { Timestamp } from "firebase/firestore";

export type PatientGender = "male" | "female" | "other";
export type PatientStatus = "active" | "inactive";

export interface PatientAddress {
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

/** Optional clinical vitals — only present when staff records them. */
export interface PatientVitals {
  bloodPressure: string | null;
  heartRate: string | null;
  spo2: string | null;
  temperature: string | null;
  temperatureUnit: "C" | "F" | null;
  respiratoryRate: string | null;
  weight: string | null;
  weightUnit: "kg" | "lb" | null;
}

/** `Patient/{id}` document shape. */
export interface Patient {
  _id: string;
  patientId: string;
  /** `Users/{uid}` if they can log in; null for staff-created walk-ins. */
  userId: string | null;
  displayName: string;
  displayNameLower: string;
  email: string | null;
  phoneNumber: string | null;
  photoUrl: string | null;
  dateOfBirth: Timestamp | Date | null;
  gender: PatientGender | null;
  bloodGroup: string | null;
  address: PatientAddress | null;
  allergies: string[];
  vitals: PatientVitals | null;
  status: PatientStatus;
  primaryDoctorId: string | null;
  lastVisit: Timestamp | Date | null;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

/** Form input for create/edit patient screens. */
export interface PatientFormValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  primaryDoctorId: string;
  dateOfBirth: string; // ISO date string from the date picker
  gender: PatientGender;
  bloodGroup: string;
  status: PatientStatus;
  addressLine1: string;
  addressLine2: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  /** Optional vitals — leave blank if not measured at registration. */
  bloodPressure: string;
  heartRate: string;
  spo2: string;
  temperature: string;
  temperatureUnit: "C" | "F";
  respiratoryRate: string;
  weight: string;
  weightUnit: "kg" | "lb";
  /** Create a Firebase Auth login so the patient can sign in. */
  createLogin: boolean;
  password: string;
  confirmPassword: string;
}

export interface ListPatientsParams {
  search?: string;
  status?: PatientStatus;
  doctorId?: string;
  pageSize?: number;
  cursor?: Patient["_id"] | null;
}

export interface ListPatientsResult {
  patients: Patient[];
  nextCursor: string | null;
}
