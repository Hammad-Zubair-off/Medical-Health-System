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
import {
  prescriptionDocSchema,
  type PrescriptionDoc,
} from "../../schemas/prescription.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField, toTimestamp } from "../../utils/firestore.utils";
import { withAudit } from "./_helpers";
import { getPatient } from "./patient.service";
import type {
  ListPrescriptionsParams,
  ListPrescriptionsResult,
  PrescriptionFormValues,
  PrescriptionStatus,
} from "../../types/prescription.types";

const COLLECTION = "Prescription";
const DEFAULT_PAGE_SIZE = 20;

export async function listPrescriptions(
  params: ListPrescriptionsParams = {}
): Promise<ListPrescriptionsResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.search) {
    const term = toLowerSearchField(params.search);
    constraints.push(orderBy("patientNameLower"), startAt(term), endAt(term + "\uf8ff"));
  } else {
    if (params.status) constraints.push(where("status", "==", params.status));
    if (params.doctorUserId) {
      constraints.push(where("doctorUserId", "==", params.doctorUserId));
    }
    if (params.patientUserId) {
      constraints.push(where("patientUserId", "==", params.patientUserId));
    }
    if (params.patientId) {
      constraints.push(where("patientId", "==", params.patientId));
    }
    constraints.push(orderBy("prescribedOn", "desc"));
  }

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }

  constraints.push(limit(pageSize));
  const snap = await getDocs(query(ref, ...constraints));
  const prescriptions = snap.docs
    .map((d) => parseDoc(prescriptionDocSchema, d, "Prescription"))
    .filter((p): p is PrescriptionDoc => p !== null);

  return {
    prescriptions: prescriptions as unknown as ListPrescriptionsResult["prescriptions"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getPrescription(id: string): Promise<PrescriptionDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return parseDoc(prescriptionDocSchema, snap, "Prescription");
}

export async function getPrescriptionsByAppointment(
  appointmentId: string
): Promise<PrescriptionDoc[]> {
  if (!appointmentId) return [];
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("appointmentId", "==", appointmentId),
      orderBy("prescribedOn", "desc"),
      limit(20)
    )
  );
  return snap.docs
    .map((d) => parseDoc(prescriptionDocSchema, d, "Prescription"))
    .filter((p): p is PrescriptionDoc => p !== null);
}

export async function createPrescription(input: {
  values: PrescriptionFormValues;
  doctorId: string;
  doctorUserId: string;
  doctorName?: string;
  actorUid?: string | null;
}): Promise<string> {
  const patient = await getPatient(input.values.patientId);
  if (!patient) throw new Error("Patient not found");

  const prescriptionId = `PRE-${Date.now().toString(36).toUpperCase()}`;
  const docRef = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        prescriptionId,
        appointmentId: input.values.appointmentId || null,
        doctorId: input.doctorId,
        doctorUserId: input.doctorUserId,
        doctorName: input.doctorName ?? null,
        patientId: patient._id,
        patientUserId: patient.userId,
        patientName: patient.displayName,
        patientNameLower: toLowerSearchField(patient.displayName),
        prescribedOn: toTimestamp(new Date()),
        diagnosis: input.values.diagnosis || null,
        notes: input.values.notes || null,
        followUpDate: input.values.followUpDate
          ? toTimestamp(new Date(input.values.followUpDate))
          : null,
        medicines: input.values.medicines.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          instructions: m.instructions || null,
        })),
        status: input.values.status ?? "active",
      },
      "create",
      input.actorUid
    )
  );
  return docRef.id;
}

export async function updatePrescription(
  id: string,
  values: Partial<PrescriptionFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.diagnosis !== undefined) payload.diagnosis = values.diagnosis || null;
  if (values.notes !== undefined) payload.notes = values.notes || null;
  if (values.followUpDate !== undefined) {
    payload.followUpDate = values.followUpDate
      ? toTimestamp(new Date(values.followUpDate))
      : null;
  }
  if (values.medicines !== undefined) {
    payload.medicines = values.medicines.map((m) => ({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      duration: m.duration,
      instructions: m.instructions || null,
    }));
  }
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, COLLECTION, id), withAudit(payload, "update", actorUid));
}

export async function cancelPrescription(
  id: string,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit({ status: "cancelled" as PrescriptionStatus }, "update", actorUid)
  );
}
