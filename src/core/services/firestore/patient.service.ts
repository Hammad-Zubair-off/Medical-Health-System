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
import { patientDocSchema, type PatientDoc } from "../../schemas/patient.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField, toTimestamp } from "../../utils/firestore.utils";
import { chunk, IN_QUERY_CHUNK_SIZE, withAudit } from "./_helpers";
import type {
  ListPatientsParams,
  ListPatientsResult,
  PatientFormValues,
} from "../../types/patient.types";

const COLLECTION = "Patient";
const DEFAULT_PAGE_SIZE = 20;

function toWriteData(values: PatientFormValues) {
  const displayName = `${values.firstName.trim()} ${values.lastName.trim()}`.trim();
  return {
    displayName,
    displayNameLower: toLowerSearchField(displayName),
    email: values.email || null,
    phoneNumber: values.phoneNumber || null,
    dateOfBirth: toTimestamp(new Date(values.dateOfBirth)),
    gender: values.gender,
    bloodGroup: values.bloodGroup,
    status: values.status,
    primaryDoctorId: values.primaryDoctorId || null,
    address: {
      line1: values.addressLine1,
      line2: values.addressLine2 || null,
      city: values.city,
      state: values.state,
      country: values.country,
      postalCode: values.postalCode,
    },
  };
}

/**
 * List patients with cursor pagination + prefix search. Never fetches the
 * whole collection — every call has `limit()` plus, when a cursor is given,
 * `startAfter()`.
 */
export async function listPatients(
  params: ListPatientsParams = {}
): Promise<ListPatientsResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.search) {
    const term = toLowerSearchField(params.search);
    constraints.push(
      orderBy("displayNameLower"),
      startAt(term),
      endAt(term + "\uf8ff")
    );
  } else {
    if (params.status) constraints.push(where("status", "==", params.status));
    if (params.doctorId) constraints.push(where("primaryDoctorId", "==", params.doctorId));
    constraints.push(orderBy("displayNameLower"));
  }

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) {
      constraints.push(startAfter(cursorSnap));
    }
  }

  constraints.push(limit(pageSize));

  const snap = await getDocs(query(ref, ...constraints));
  const patients = snap.docs
    .map((d) => parseDoc(patientDocSchema, d, "Patient"))
    .filter((p): p is PatientDoc => p !== null);

  const nextCursor =
    snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null;

  return { patients: patients as unknown as ListPatientsResult["patients"], nextCursor };
}

export async function getPatient(id: string): Promise<PatientDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return parseDoc(patientDocSchema, snap, "Patient");
}

/** Look up the Patient doc linked to a Users/{uid}. Used for the doctor↔patient join. */
export async function getPatientByUserId(uid: string): Promise<PatientDoc | null> {
  if (!uid) return null;
  const found = await getPatientsByUserIds([uid]);
  return found[0] ?? null;
}

/** Batched lookup so appointment lists don't N+1 on `userId`. */
export async function getPatientsByUserIds(uids: string[]): Promise<PatientDoc[]> {
  const unique = Array.from(new Set(uids.filter(Boolean)));
  if (unique.length === 0) return [];

  const ref = collection(db, COLLECTION);
  const snaps = await Promise.all(
    chunk(unique, IN_QUERY_CHUNK_SIZE).map((idChunk) =>
      getDocs(query(ref, where("userId", "in", idChunk)))
    )
  );

  return snaps
    .flatMap((snap) => snap.docs)
    .map((d) => parseDoc(patientDocSchema, d, "Patient"))
    .filter((p): p is PatientDoc => p !== null);
}

export async function createPatient(
  values: PatientFormValues,
  actorUid?: string | null,
  userId: string | null = null
): Promise<string> {
  const ref = collection(db, COLLECTION);
  const patientId = `PT-${Date.now().toString(36).toUpperCase()}`;
  const docRef = await addDoc(
    ref,
    withAudit(
      {
        patientId,
        userId,
        ...toWriteData(values),
        allergies: [],
        lastVisit: null,
      },
      "create",
      actorUid
    )
  );
  return docRef.id;
}

export async function updatePatient(
  id: string,
  values: PatientFormValues,
  actorUid?: string | null
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, withAudit(toWriteData(values), "update", actorUid));
}

/** Medical records are never hard-deleted. Deactivate instead. */
export async function setPatientStatus(
  id: string,
  status: "active" | "inactive",
  actorUid?: string | null
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, withAudit({ status }, "update", actorUid));
}

/**
 * Create a minimal `Patient/{id}` doc linked to a just-registered Users/{uid}.
 * Called from `signUpPatient` — self-registration only collects name/email/
 * phone, so clinical fields (DOB, gender, address, etc.) start empty and are
 * filled in later via `updatePatient`.
 */
export async function createLinkedPatient(
  uid: string,
  data: { displayName: string; email: string; phoneNumber: string }
): Promise<string> {
  const ref = collection(db, COLLECTION);
  const patientId = `PT-${Date.now().toString(36).toUpperCase()}`;
  const docRef = await addDoc(
    ref,
    withAudit(
      {
        patientId,
        userId: uid,
        displayName: data.displayName,
        displayNameLower: toLowerSearchField(data.displayName),
        email: data.email || null,
        phoneNumber: data.phoneNumber || null,
        photoUrl: null,
        dateOfBirth: null,
        gender: null,
        bloodGroup: null,
        address: null,
        allergies: [],
        status: "active",
        primaryDoctorId: null,
        lastVisit: null,
      },
      "create",
      uid
    )
  );
  return docRef.id;
}

/** Denormalised `lastVisit` write — call this when an appointment completes. */
export async function touchLastVisit(
  patientDocId: string,
  visitDate: Date
): Promise<void> {
  const ref = doc(db, COLLECTION, patientDocId);
  await updateDoc(ref, { lastVisit: toTimestamp(visitDate) });
}
