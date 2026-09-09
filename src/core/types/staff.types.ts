import type { Timestamp } from "firebase/firestore";

export type StaffStatus = "active" | "inactive";
export type EmploymentType = "full-time" | "part-time" | "contract" | "intern";

/** `Staff/{id}` document shape. */
export interface Staff {
  _id: string;
  staffId: string;
  /** `Users/{uid}` if they can log in; null for non-login staff. */
  userId: string | null;
  displayName: string;
  displayNameLower: string;
  email: string | null;
  phoneNumber: string | null;
  photoUrl: string | null;
  departmentId: string | null;
  departmentName: string | null;
  designationId: string | null;
  designationName: string | null;
  joiningDate: Timestamp | Date | null;
  employmentType: EmploymentType;
  status: StaffStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface StaffFormValues {
  displayName: string;
  email: string;
  phoneNumber: string;
  departmentId: string;
  designationId: string;
  joiningDate: string;
  employmentType: EmploymentType;
  status: StaffStatus;
  userId: string;
}

export interface ListStaffParams {
  search?: string;
  status?: StaffStatus;
  departmentId?: string;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListStaffResult {
  staff: Staff[];
  nextCursor: string | null;
}
