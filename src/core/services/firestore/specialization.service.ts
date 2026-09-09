import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  specializationDocSchema,
  type SpecializationDoc,
} from "../../schemas/specialization.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField } from "../../utils/firestore.utils";
import { withAudit } from "./_helpers";
import type { SpecializationFormValues } from "../../types/specialization.types";

const COLLECTION = "Specialization";

export async function listSpecializations(
  onlyActive = false
): Promise<SpecializationDoc[]> {
  const ref = collection(db, COLLECTION);
  const constraints = onlyActive
    ? [where("status", "==", "active"), orderBy("nameLower")]
    : [orderBy("nameLower")];
  const snap = await getDocs(query(ref, ...constraints));
  return snap.docs
    .map((d) => parseDoc(specializationDocSchema, d, "Specialization"))
    .filter((s): s is SpecializationDoc => s !== null);
}

export async function getSpecialization(id: string): Promise<SpecializationDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return parseDoc(specializationDocSchema, snap, "Specialization");
}

export async function createSpecialization(
  values: SpecializationFormValues,
  actorUid?: string | null
): Promise<string> {
  const ref = collection(db, COLLECTION);
  const docRef = await addDoc(
    ref,
    withAudit(
      {
        name: values.name,
        nameLower: toLowerSearchField(values.name),
        description: values.description || null,
        icon: values.icon || null,
        status: values.status,
      },
      "create",
      actorUid
    )
  );
  return docRef.id;
}

export async function updateSpecialization(
  id: string,
  values: SpecializationFormValues,
  actorUid?: string | null
): Promise<void> {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(
    ref,
    withAudit(
      {
        name: values.name,
        nameLower: toLowerSearchField(values.name),
        description: values.description || null,
        icon: values.icon || null,
        status: values.status,
      },
      "update",
      actorUid
    )
  );
}
