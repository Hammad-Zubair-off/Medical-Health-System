import type { Timestamp } from "firebase/firestore";

export type HolidayStatus = "active" | "inactive";

/** Clinic-wide `Holiday/{id}` — distinct from per-doctor `Doctor.holidays`. */
export interface Holiday {
  _id: string;
  name: string;
  date: Timestamp | Date | null;
  isRecurring: boolean;
  status: HolidayStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface HolidayFormValues {
  name: string;
  date: string;
  isRecurring: boolean;
  status: HolidayStatus;
}

export interface ListHolidaysParams {
  status?: HolidayStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListHolidaysResult {
  holidays: Holiday[];
  nextCursor: string | null;
}
