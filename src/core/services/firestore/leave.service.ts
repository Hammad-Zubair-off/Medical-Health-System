import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  leaveDocSchema,
  leaveTypeDocSchema,
  type LeaveDoc,
  type LeaveTypeDoc,
} from "../../schemas/leave.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField, toTimestamp } from "../../utils/firestore.utils";
import { countLeaveDays } from "../../utils/leave.utils";
import { withAudit } from "./_helpers";
import { getStaff } from "./staff.service";
import type {
  LeaveFormValues,
  LeaveStatus,
  LeaveTypeFormValues,
  LeaveTypeStatus,
  ListLeavesParams,
  ListLeavesResult,
  ListLeaveTypesParams,
  ListLeaveTypesResult,
} from "../../types/leave.types";

const LEAVE = "Leave";
const LEAVE_TYPE = "LeaveType";
const DEFAULT_PAGE_SIZE = 20;

export async function listLeaveTypes(
  params: ListLeaveTypesParams = {}
): Promise<ListLeaveTypesResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const constraints: QueryConstraint[] = [];
  if (params.status) constraints.push(where("status", "==", params.status));
  constraints.push(orderBy("nameLower"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, LEAVE_TYPE, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, LEAVE_TYPE), ...constraints));
  const leaveTypes = snap.docs
    .map((d) => parseDoc(leaveTypeDocSchema, d, "LeaveType"))
    .filter((p): p is LeaveTypeDoc => p !== null);

  return {
    leaveTypes: leaveTypes as unknown as ListLeaveTypesResult["leaveTypes"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function createLeaveType(
  values: LeaveTypeFormValues,
  actorUid?: string | null
): Promise<string> {
  const name = values.name.trim();
  const ref = await addDoc(
    collection(db, LEAVE_TYPE),
    withAudit(
      {
        name,
        nameLower: toLowerSearchField(name),
        daysAllowedPerYear: values.daysAllowedPerYear,
        isPaid: values.isPaid,
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateLeaveType(
  id: string,
  values: Partial<LeaveTypeFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.name !== undefined) {
    payload.name = values.name.trim();
    payload.nameLower = toLowerSearchField(values.name);
  }
  if (values.daysAllowedPerYear !== undefined) {
    payload.daysAllowedPerYear = values.daysAllowedPerYear;
  }
  if (values.isPaid !== undefined) payload.isPaid = values.isPaid;
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, LEAVE_TYPE, id), withAudit(payload, "update", actorUid));
}

export async function setLeaveTypeStatus(
  id: string,
  status: LeaveTypeStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, LEAVE_TYPE, id),
    withAudit({ status }, "update", actorUid)
  );
}

export async function listLeaves(
  params: ListLeavesParams = {}
): Promise<ListLeavesResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const constraints: QueryConstraint[] = [];

  if (params.staffUserId) {
    constraints.push(where("staffUserId", "==", params.staffUserId));
  }
  if (params.staffId) constraints.push(where("staffId", "==", params.staffId));
  if (params.status) constraints.push(where("status", "==", params.status));
  if (params.leaveTypeId) {
    constraints.push(where("leaveTypeId", "==", params.leaveTypeId));
  }
  constraints.push(orderBy("from", "desc"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, LEAVE, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, LEAVE), ...constraints));
  const leaves = snap.docs
    .map((d) => parseDoc(leaveDocSchema, d, "Leave"))
    .filter((p): p is LeaveDoc => p !== null);

  return {
    leaves: leaves as unknown as ListLeavesResult["leaves"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getLeave(id: string): Promise<LeaveDoc | null> {
  if (!id) return null;
  return parseDoc(leaveDocSchema, await getDoc(doc(db, LEAVE, id)), "Leave");
}

export async function createLeave(
  values: LeaveFormValues,
  actorUid?: string | null,
  options: { asAdmin?: boolean; status?: LeaveStatus } = {}
): Promise<string> {
  const staff = await getStaff(values.staffId);
  if (!staff) throw new Error("Staff not found");

  let leaveTypeName: string | null = null;
  if (values.leaveTypeId) {
    const typeSnap = await getDoc(doc(db, LEAVE_TYPE, values.leaveTypeId));
    if (typeSnap.exists()) leaveTypeName = (typeSnap.data().name as string) ?? null;
  }

  const from = new Date(values.from);
  const to = new Date(values.to);
  const days = countLeaveDays(from, to);
  const status: LeaveStatus =
    options.asAdmin && options.status ? options.status : "pending";

  const ref = await addDoc(
    collection(db, LEAVE),
    withAudit(
      {
        staffId: values.staffId,
        staffUserId: staff.userId,
        staffName: staff.displayName,
        leaveTypeId: values.leaveTypeId,
        leaveTypeName,
        from: toTimestamp(from),
        to: toTimestamp(to),
        days,
        reason: values.reason || null,
        status,
        reviewedBy: null,
        reviewedOn: null,
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function reviewLeave(
  id: string,
  status: "approved" | "rejected",
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, LEAVE, id),
    withAudit(
      {
        status,
        reviewedBy: actorUid ?? null,
        reviewedOn: toTimestamp(new Date()),
      },
      "update",
      actorUid
    )
  );
}
