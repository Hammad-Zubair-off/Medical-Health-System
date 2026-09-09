import type { Timestamp } from "firebase/firestore";

export type LeaveTypeStatus = "active" | "inactive";
export type LeaveStatus = "pending" | "approved" | "rejected";

/** `LeaveType/{id}` document shape. */
export interface LeaveType {
  _id: string;
  name: string;
  nameLower: string;
  daysAllowedPerYear: number;
  isPaid: boolean;
  status: LeaveTypeStatus;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface LeaveTypeFormValues {
  name: string;
  daysAllowedPerYear: number;
  isPaid: boolean;
  status: LeaveTypeStatus;
}

export interface ListLeaveTypesParams {
  status?: LeaveTypeStatus;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListLeaveTypesResult {
  leaveTypes: LeaveType[];
  nextCursor: string | null;
}

/** `Leave/{id}` document shape. */
export interface Leave {
  _id: string;
  staffId: string;
  staffUserId: string | null;
  staffName: string | null;
  leaveTypeId: string;
  leaveTypeName: string | null;
  from: Timestamp | Date | null;
  to: Timestamp | Date | null;
  days: number;
  reason: string | null;
  status: LeaveStatus;
  reviewedBy: string | null;
  reviewedOn: Timestamp | Date | null;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface LeaveFormValues {
  staffId: string;
  leaveTypeId: string;
  from: string;
  to: string;
  reason: string;
}

export interface ListLeavesParams {
  staffUserId?: string;
  staffId?: string;
  status?: LeaveStatus;
  leaveTypeId?: string;
  pageSize?: number;
  cursor?: string | null;
}

export interface ListLeavesResult {
  leaves: Leave[];
  nextCursor: string | null;
}
