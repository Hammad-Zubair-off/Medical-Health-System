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
  Timestamp,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  attendanceDocSchema,
  type AttendanceDoc,
} from "../../schemas/attendance.schema";
import { parseDoc } from "../../schemas/_shared";
import { toDate, toTimestamp } from "../../utils/firestore.utils";
import { withAudit } from "./_helpers";
import { getStaff } from "./staff.service";
import type {
  AttendanceFormValues,
  AttendanceStatus,
  ListAttendanceParams,
  ListAttendanceResult,
} from "../../types/attendance.types";

const COLLECTION = "Attendance";
const DEFAULT_PAGE_SIZE = 50;

function workedMinutesFromRange(
  checkIn: Date | null,
  checkOut: Date | null
): number {
  if (!checkIn || !checkOut) return 0;
  const mins = Math.round((checkOut.getTime() - checkIn.getTime()) / 60000);
  return Math.max(0, mins);
}

export async function listAttendance(
  params: ListAttendanceParams = {}
): Promise<ListAttendanceResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const constraints: QueryConstraint[] = [];

  if (params.staffId) constraints.push(where("staffId", "==", params.staffId));

  if (params.fromDate || params.toDate) {
    if (params.fromDate) {
      constraints.push(
        where("date", ">=", Timestamp.fromDate(new Date(params.fromDate)))
      );
    }
    if (params.toDate) {
      const end = new Date(params.toDate);
      end.setHours(23, 59, 59, 999);
      constraints.push(where("date", "<=", Timestamp.fromDate(end)));
    }
  }

  constraints.push(orderBy("date", "desc"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
  const records = snap.docs
    .map((d) => parseDoc(attendanceDocSchema, d, "Attendance"))
    .filter((p): p is AttendanceDoc => p !== null);

  return {
    records: records as unknown as ListAttendanceResult["records"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function createAttendance(
  values: AttendanceFormValues,
  actorUid?: string | null
): Promise<string> {
  const staff = await getStaff(values.staffId);
  if (!staff) throw new Error("Staff not found");

  const checkIn = values.checkIn ? new Date(values.checkIn) : null;
  const checkOut = values.checkOut ? new Date(values.checkOut) : null;

  const ref = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        staffId: values.staffId,
        staffName: staff.displayName,
        date: toTimestamp(new Date(values.date)),
        checkIn: checkIn ? toTimestamp(checkIn) : null,
        checkOut: checkOut ? toTimestamp(checkOut) : null,
        status: values.status,
        workedMinutes: workedMinutesFromRange(checkIn, checkOut),
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateAttendance(
  id: string,
  values: Partial<AttendanceFormValues>,
  actorUid?: string | null
): Promise<void> {
  const existing = await getDoc(doc(db, COLLECTION, id));
  if (!existing.exists()) throw new Error("Attendance not found");
  const data = existing.data();

  const checkIn =
    values.checkIn !== undefined
      ? values.checkIn
        ? new Date(values.checkIn)
        : null
      : toDate(data.checkIn);
  const checkOut =
    values.checkOut !== undefined
      ? values.checkOut
        ? new Date(values.checkOut)
        : null
      : toDate(data.checkOut);

  const payload: Record<string, unknown> = {
    checkIn: checkIn ? toTimestamp(checkIn) : null,
    checkOut: checkOut ? toTimestamp(checkOut) : null,
    workedMinutes: workedMinutesFromRange(checkIn, checkOut),
  };
  if (values.date !== undefined) payload.date = toTimestamp(new Date(values.date));
  if (values.status !== undefined) payload.status = values.status as AttendanceStatus;
  if (values.staffId !== undefined) {
    const staff = await getStaff(values.staffId);
    if (!staff) throw new Error("Staff not found");
    payload.staffId = values.staffId;
    payload.staffName = staff.displayName;
  }

  await updateDoc(doc(db, COLLECTION, id), withAudit(payload, "update", actorUid));
}
