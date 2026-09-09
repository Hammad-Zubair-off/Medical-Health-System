import {
  addDoc,
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  startAt,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { staffDocSchema, type StaffDoc } from "../../schemas/staff.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField, toTimestamp } from "../../utils/firestore.utils";
import { withAudit } from "./_helpers";
import type {
  ListStaffParams,
  ListStaffResult,
  StaffFormValues,
  StaffStatus,
} from "../../types/staff.types";

const COLLECTION = "Staff";
const DEFAULT_PAGE_SIZE = 20;

function toWriteData(
  values: StaffFormValues,
  names: { departmentName: string | null; designationName: string | null }
) {
  const displayName = values.displayName.trim();
  return {
    displayName,
    displayNameLower: toLowerSearchField(displayName),
    email: values.email || null,
    phoneNumber: values.phoneNumber || null,
    departmentId: values.departmentId || null,
    departmentName: names.departmentName,
    designationId: values.designationId || null,
    designationName: names.designationName,
    joiningDate: values.joiningDate
      ? toTimestamp(new Date(values.joiningDate))
      : null,
    employmentType: values.employmentType,
    status: values.status,
    userId: values.userId || null,
  };
}

async function resolveNames(departmentId: string, designationId: string) {
  let departmentName: string | null = null;
  let designationName: string | null = null;
  if (departmentId) {
    const snap = await getDoc(doc(db, "Department", departmentId));
    if (snap.exists()) departmentName = (snap.data().name as string) ?? null;
  }
  if (designationId) {
    const snap = await getDoc(doc(db, "Designation", designationId));
    if (snap.exists()) designationName = (snap.data().name as string) ?? null;
  }
  return { departmentName, designationName };
}

export async function listStaff(
  params: ListStaffParams = {}
): Promise<ListStaffResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.search) {
    const term = toLowerSearchField(params.search);
    constraints.push(orderBy("displayNameLower"), startAt(term), endAt(term + "\uf8ff"));
  } else {
    if (params.status) constraints.push(where("status", "==", params.status));
    if (params.departmentId) {
      constraints.push(where("departmentId", "==", params.departmentId));
    }
    constraints.push(orderBy("displayNameLower"));
  }

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }

  constraints.push(limit(pageSize));
  const snap = await getDocs(query(ref, ...constraints));
  const staff = snap.docs
    .map((d) => parseDoc(staffDocSchema, d, "Staff"))
    .filter((p): p is StaffDoc => p !== null);

  return {
    staff: staff as unknown as ListStaffResult["staff"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getStaff(id: string): Promise<StaffDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return parseDoc(staffDocSchema, snap, "Staff");
}

export async function getStaffByUserId(uid: string): Promise<StaffDoc | null> {
  if (!uid) return null;
  const snap = await getDocs(
    query(collection(db, COLLECTION), where("userId", "==", uid), limit(1))
  );
  if (snap.empty) return null;
  return parseDoc(staffDocSchema, snap.docs[0], "Staff");
}

export async function createStaff(
  values: StaffFormValues,
  actorUid?: string | null
): Promise<string> {
  const names = await resolveNames(values.departmentId, values.designationId);
  const staffId = `STF-${Date.now().toString(36).toUpperCase()}`;
  const docRef = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        staffId,
        photoUrl: null,
        ...toWriteData(values, names),
      },
      "create",
      actorUid
    )
  );
  return docRef.id;
}

export async function updateStaff(
  id: string,
  values: StaffFormValues,
  actorUid?: string | null
): Promise<void> {
  const names = await resolveNames(values.departmentId, values.designationId);
  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit(toWriteData(values, names), "update", actorUid)
  );
}

export async function setStaffStatus(
  id: string,
  status: StaffStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit({ status }, "update", actorUid)
  );
}
