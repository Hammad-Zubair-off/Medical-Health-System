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
import { assetDocSchema, type AssetDoc } from "../../schemas/asset.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField, toTimestamp } from "../../utils/firestore.utils";
import { toMinor } from "../../utils/money.utils";
import { withAudit } from "./_helpers";
import type {
  AssetFormValues,
  AssetStatus,
  ListAssetsParams,
  ListAssetsResult,
} from "../../types/asset.types";

const COLLECTION = "Asset";
const DEFAULT_PAGE_SIZE = 20;

export async function listAssets(
  params: ListAssetsParams = {}
): Promise<ListAssetsResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.locationId && params.status) {
    constraints.push(where("locationId", "==", params.locationId));
    constraints.push(where("status", "==", params.status));
  } else if (params.locationId) {
    constraints.push(where("locationId", "==", params.locationId));
    constraints.push(orderBy("nameLower"));
  } else if (params.status) {
    constraints.push(where("status", "==", params.status));
    constraints.push(orderBy("nameLower"));
  } else {
    constraints.push(orderBy("nameLower"));
  }

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }

  constraints.push(limit(pageSize));
  const snap = await getDocs(query(ref, ...constraints));
  const assets = snap.docs
    .map((d) => parseDoc(assetDocSchema, d, "Asset"))
    .filter((a): a is AssetDoc => a !== null);

  return {
    assets: assets as unknown as ListAssetsResult["assets"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getAsset(id: string): Promise<AssetDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return parseDoc(assetDocSchema, snap, "Asset");
}

export async function createAsset(
  values: AssetFormValues,
  actorUid?: string | null
): Promise<string> {
  const assetId = `AST-${Date.now().toString(36).toUpperCase()}`;
  const docRef = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        assetId,
        name: values.name.trim(),
        nameLower: toLowerSearchField(values.name),
        category: values.category.trim() || null,
        serialNumber: values.serialNumber.trim() || null,
        purchaseDate: values.purchaseDate
          ? toTimestamp(new Date(values.purchaseDate))
          : null,
        purchaseCost: toMinor(values.purchaseCost),
        assignedToStaffId: values.assignedToStaffId || null,
        locationId: values.locationId || null,
        status: values.status,
      },
      "create",
      actorUid
    )
  );
  return docRef.id;
}

export async function updateAsset(
  id: string,
  values: AssetFormValues,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit(
      {
        name: values.name.trim(),
        nameLower: toLowerSearchField(values.name),
        category: values.category.trim() || null,
        serialNumber: values.serialNumber.trim() || null,
        purchaseDate: values.purchaseDate
          ? toTimestamp(new Date(values.purchaseDate))
          : null,
        purchaseCost: toMinor(values.purchaseCost),
        assignedToStaffId: values.assignedToStaffId || null,
        locationId: values.locationId || null,
        status: values.status,
      },
      "update",
      actorUid
    )
  );
}

export async function setAssetStatus(
  id: string,
  status: AssetStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), withAudit({ status }, "update", actorUid));
}
