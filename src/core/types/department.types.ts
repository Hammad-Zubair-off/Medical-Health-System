import type { Timestamp } from "firebase/firestore";

export type DepartmentStatus = "active" | "inactive";
export type DesignationStatus = "active" | "inactive";

/** `Department/{id}` document shape. */
export interface Department {
  _id: string;
  name: string;
  nameLower: string;
  headStaffId: string | null;
  status: DepartmentStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface DepartmentFormValues {
  name: string;
  headStaffId: string;
  status: DepartmentStatus;
}

export interface ListDepartmentsParams {
  status?: DepartmentStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListDepartmentsResult {
  departments: Department[];
  nextCursor: string | null;
}

/** `Designation/{id}` document shape. */
export interface Designation {
  _id: string;
  name: string;
  nameLower: string;
  departmentId: string | null;
  status: DesignationStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface DesignationFormValues {
  name: string;
  departmentId: string;
  status: DesignationStatus;
}

export interface ListDesignationsParams {
  status?: DesignationStatus;
  departmentId?: string;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListDesignationsResult {
  designations: Designation[];
  nextCursor: string | null;
}
