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
import { serviceDocSchema, type ServiceDoc } from "../../schemas/service.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField } from "../../utils/firestore.utils";
import { toMinor } from "../../utils/money.utils";
import { withAudit } from "./_helpers";
import type {
  ListServicesParams,
  ListServicesResult,
  ServiceFormValues,
  ServiceStatus,
} from "../../types/service.types";

const COLLECTION = "Service";
const DEFAULT_PAGE_SIZE = 50;

export async function listServices(
  params: ListServicesParams = {}
): Promise<ListServicesResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.status) {
    constraints.push(where("status", "==", params.status));
  }
  constraints.push(orderBy("nameLower"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }

  constraints.push(limit(pageSize));
  const snap = await getDocs(query(ref, ...constraints));
  const services = snap.docs
    .map((d) => parseDoc(serviceDocSchema, d, "Service"))
    .filter((s): s is ServiceDoc => s !== null);

  return {
    services: services as unknown as ListServicesResult["services"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getService(id: string): Promise<ServiceDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return parseDoc(serviceDocSchema, snap, "Service");
}

async function resolveSpecializationName(
  specializationId: string
): Promise<string | null> {
  if (!specializationId) return null;
  const snap = await getDoc(doc(db, "Specialization", specializationId));
  if (!snap.exists()) return null;
  return (snap.data().name as string) ?? null;
}

export async function createService(
  values: ServiceFormValues,
  actorUid?: string | null
): Promise<string> {
  const specializationName = await resolveSpecializationName(values.specializationId);
  const docRef = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        name: values.name.trim(),
        nameLower: toLowerSearchField(values.name),
        specializationId: values.specializationId || null,
        specializationName,
        price: toMinor(values.price),
        durationMinutes: values.durationMinutes || null,
        description: values.description.trim() || null,
        status: values.status,
      },
      "create",
      actorUid
    )
  );
  return docRef.id;
}

export async function updateService(
  id: string,
  values: ServiceFormValues,
  actorUid?: string | null
): Promise<void> {
  const specializationName = await resolveSpecializationName(values.specializationId);
  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit(
      {
        name: values.name.trim(),
        nameLower: toLowerSearchField(values.name),
        specializationId: values.specializationId || null,
        specializationName,
        price: toMinor(values.price),
        durationMinutes: values.durationMinutes || null,
        description: values.description.trim() || null,
        status: values.status,
      },
      "update",
      actorUid
    )
  );
}

export async function setServiceStatus(
  id: string,
  status: ServiceStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), withAudit({ status }, "update", actorUid));
}
