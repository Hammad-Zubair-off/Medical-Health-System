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
import { locationDocSchema, type LocationDoc } from "../../schemas/location.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField } from "../../utils/firestore.utils";
import { withAudit } from "./_helpers";
import type {
  ListLocationsParams,
  ListLocationsResult,
  LocationFormValues,
  LocationStatus,
} from "../../types/location.types";

const COLLECTION = "Location";
const DEFAULT_PAGE_SIZE = 50;

export async function listLocations(
  params: ListLocationsParams = {}
): Promise<ListLocationsResult> {
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
  const locations = snap.docs
    .map((d) => parseDoc(locationDocSchema, d, "Location"))
    .filter((l): l is LocationDoc => l !== null);

  return {
    locations: locations as unknown as ListLocationsResult["locations"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getLocation(id: string): Promise<LocationDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return parseDoc(locationDocSchema, snap, "Location");
}

export async function createLocation(
  values: LocationFormValues,
  actorUid?: string | null
): Promise<string> {
  const docRef = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        name: values.name.trim(),
        nameLower: toLowerSearchField(values.name),
        address: {
          line1: values.addressLine1,
          line2: values.addressLine2 || null,
          city: values.city,
          state: values.state,
          country: values.country,
          postalCode: values.postalCode || null,
        },
        phoneNumber: values.phoneNumber || null,
        email: values.email || null,
        status: values.status,
      },
      "create",
      actorUid
    )
  );
  return docRef.id;
}

export async function updateLocation(
  id: string,
  values: LocationFormValues,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit(
      {
        name: values.name.trim(),
        nameLower: toLowerSearchField(values.name),
        address: {
          line1: values.addressLine1,
          line2: values.addressLine2 || null,
          city: values.city,
          state: values.state,
          country: values.country,
          postalCode: values.postalCode || null,
        },
        phoneNumber: values.phoneNumber || null,
        email: values.email || null,
        status: values.status,
      },
      "update",
      actorUid
    )
  );
}

export async function setLocationStatus(
  id: string,
  status: LocationStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), withAudit({ status }, "update", actorUid));
}
