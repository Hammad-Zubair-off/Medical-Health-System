import type { Timestamp } from "firebase/firestore";

export type AttendanceStatus = "present" | "absent" | "holiday" | "half-day" | "leave";

/** `Attendance/{id}` document shape. */
export interface Attendance {
  _id: string;
  staffId: string;
  staffName: string | null;
  date: Timestamp | Date | null;
  checkIn: Timestamp | Date | null;
  checkOut: Timestamp | Date | null;
  status: AttendanceStatus;
  workedMinutes: number;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface AttendanceFormValues {
  staffId: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: AttendanceStatus;
}

export interface ListAttendanceParams {
  staffId?: string;
  /** ISO date string — filters a single calendar day when set with end of range. */
  fromDate?: string;
  toDate?: string;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListAttendanceResult {
  records: Attendance[];
  nextCursor: string | null;
}
