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
  departmentDocSchema,
  designationDocSchema,
  type DepartmentDoc,
  type DesignationDoc,
} from "../../schemas/department.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField } from "../../utils/firestore.utils";
import { withAudit } from "./_helpers";
import type {
  DepartmentFormValues,
  DepartmentStatus,
  DesignationFormValues,
  DesignationStatus,
  ListDepartmentsParams,
  ListDepartmentsResult,
  ListDesignationsParams,
  ListDesignationsResult,
} from "../../types/department.types";

const DEPT = "Department";
const DESIG = "Designation";
const DEFAULT_PAGE_SIZE = 20;

export async function listDepartments(
  params: ListDepartmentsParams = {}
): Promise<ListDepartmentsResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const constraints: QueryConstraint[] = [];
  if (params.status) constraints.push(where("status", "==", params.status));
  constraints.push(orderBy("nameLower"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, DEPT, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, DEPT), ...constraints));
  const departments = snap.docs
    .map((d) => parseDoc(departmentDocSchema, d, "Department"))
    .filter((p): p is DepartmentDoc => p !== null);

  return {
    departments: departments as unknown as ListDepartmentsResult["departments"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getDepartment(id: string): Promise<DepartmentDoc | null> {
  if (!id) return null;
  return parseDoc(departmentDocSchema, await getDoc(doc(db, DEPT, id)), "Department");
}

export async function createDepartment(
  values: DepartmentFormValues,
  actorUid?: string | null
): Promise<string> {
  const name = values.name.trim();
  const ref = await addDoc(
    collection(db, DEPT),
    withAudit(
      {
        name,
        nameLower: toLowerSearchField(name),
        headStaffId: values.headStaffId || null,
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateDepartment(
  id: string,
  values: Partial<DepartmentFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.name !== undefined) {
    payload.name = values.name.trim();
    payload.nameLower = toLowerSearchField(values.name);
  }
  if (values.headStaffId !== undefined) {
    payload.headStaffId = values.headStaffId || null;
  }
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, DEPT, id), withAudit(payload, "update", actorUid));
}

export async function setDepartmentStatus(
  id: string,
  status: DepartmentStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(doc(db, DEPT, id), withAudit({ status }, "update", actorUid));
}

export async function listDesignations(
  params: ListDesignationsParams = {}
): Promise<ListDesignationsResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const constraints: QueryConstraint[] = [];
  if (params.status) constraints.push(where("status", "==", params.status));
  if (params.departmentId) {
    constraints.push(where("departmentId", "==", params.departmentId));
  }
  constraints.push(orderBy("nameLower"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, DESIG, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, DESIG), ...constraints));
  const designations = snap.docs
    .map((d) => parseDoc(designationDocSchema, d, "Designation"))
    .filter((p): p is DesignationDoc => p !== null);

  return {
    designations:
      designations as unknown as ListDesignationsResult["designations"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getDesignation(id: string): Promise<DesignationDoc | null> {
  if (!id) return null;
  return parseDoc(
    designationDocSchema,
    await getDoc(doc(db, DESIG, id)),
    "Designation"
  );
}

export async function createDesignation(
  values: DesignationFormValues,
  actorUid?: string | null
): Promise<string> {
  const name = values.name.trim();
  const ref = await addDoc(
    collection(db, DESIG),
    withAudit(
      {
        name,
        nameLower: toLowerSearchField(name),
        departmentId: values.departmentId || null,
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateDesignation(
  id: string,
  values: Partial<DesignationFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.name !== undefined) {
    payload.name = values.name.trim();
    payload.nameLower = toLowerSearchField(values.name);
  }
  if (values.departmentId !== undefined) {
    payload.departmentId = values.departmentId || null;
  }
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, DESIG, id), withAudit(payload, "update", actorUid));
}

export async function setDesignationStatus(
  id: string,
  status: DesignationStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(doc(db, DESIG, id), withAudit({ status }, "update", actorUid));
}
