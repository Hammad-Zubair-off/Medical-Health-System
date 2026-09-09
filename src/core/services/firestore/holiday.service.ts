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
import { holidayDocSchema, type HolidayDoc } from "../../schemas/holiday.schema";
import { parseDoc } from "../../schemas/_shared";
import { toTimestamp } from "../../utils/firestore.utils";
import {
  anyHolidayMatchesDate,
  startOfLocalDay,
} from "../../utils/holiday.utils";
import { withAudit } from "./_helpers";
import type {
  HolidayFormValues,
  HolidayStatus,
  ListHolidaysParams,
  ListHolidaysResult,
} from "../../types/holiday.types";

const COLLECTION = "Holiday";
const DEFAULT_PAGE_SIZE = 50;
/** Clinic holidays are bounded; keep a hard cap for the booking check. */
const ACTIVE_HOLIDAY_CAP = 200;

export async function listHolidays(
  params: ListHolidaysParams = {}
): Promise<ListHolidaysResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const constraints: QueryConstraint[] = [];
  if (params.status) constraints.push(where("status", "==", params.status));
  constraints.push(orderBy("date", "asc"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
  const holidays = snap.docs
    .map((d) => parseDoc(holidayDocSchema, d, "Holiday"))
    .filter((p): p is HolidayDoc => p !== null);

  return {
    holidays: holidays as unknown as ListHolidaysResult["holidays"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function listActiveHolidays(): Promise<HolidayDoc[]> {
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("status", "==", "active"),
      orderBy("date", "asc"),
      limit(ACTIVE_HOLIDAY_CAP)
    )
  );
  return snap.docs
    .map((d) => parseDoc(holidayDocSchema, d, "Holiday"))
    .filter((p): p is HolidayDoc => p !== null);
}

/** True when `date` matches any active clinic-wide Holiday (incl. recurring). */
export async function isClinicWideHoliday(date: Date): Promise<boolean> {
  const checkDate = startOfLocalDay(date);
  const holidays = await listActiveHolidays();
  return anyHolidayMatchesDate(
    holidays.map((h) => ({
      date: h.date,
      isRecurring: h.isRecurring,
      status: h.status,
    })),
    checkDate
  );
}

export async function createHoliday(
  values: HolidayFormValues,
  actorUid?: string | null
): Promise<string> {
  const ref = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        name: values.name.trim(),
        date: toTimestamp(new Date(values.date)),
        isRecurring: values.isRecurring,
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateHoliday(
  id: string,
  values: Partial<HolidayFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.name !== undefined) payload.name = values.name.trim();
  if (values.date !== undefined) payload.date = toTimestamp(new Date(values.date));
  if (values.isRecurring !== undefined) payload.isRecurring = values.isRecurring;
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, COLLECTION, id), withAudit(payload, "update", actorUid));
}

export async function setHolidayStatus(
  id: string,
  status: HolidayStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit({ status }, "update", actorUid)
  );
}
