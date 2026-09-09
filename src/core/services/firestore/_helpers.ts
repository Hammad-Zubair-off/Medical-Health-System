import {
  collection,
  documentId,
  getDocs,
  query,
  serverTimestamp,
  where,
  type DocumentData,
  type Firestore,
  type QueryDocumentSnapshot,
} from "firebase/firestore";
import { auth } from "../../../firebase";

/** Firestore `in` queries accept at most 10 values per clause. */
export const IN_QUERY_CHUNK_SIZE = 10;

export function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Batched-by-id reader. Fixes the N+1 pattern (`await` inside a `for` loop over
 * documents) flagged repeatedly in the audit — e.g. `admin.service.ts`.
 *
 * Chunks `ids` into groups of 10 and issues one `where(documentId(), "in", chunk)`
 * query per group, so `n` ids cost `ceil(n/10)` reads instead of `n`.
 */
export async function getDocsByIds(
  db: Firestore,
  collectionPath: string,
  ids: string[]
): Promise<QueryDocumentSnapshot<DocumentData>[]> {
  const uniqueIds = Array.from(new Set(ids.filter(Boolean)));
  if (uniqueIds.length === 0) return [];

  const ref = collection(db, collectionPath);
  const results = await Promise.all(
    chunk(uniqueIds, IN_QUERY_CHUNK_SIZE).map(async (idChunk) => {
      const q = query(ref, where(documentId(), "in", idChunk));
      const snap = await getDocs(q);
      return snap.docs;
    })
  );

  return results.flat();
}

export type AuditMode = "create" | "update";

/** Stamps `created/createdBy` (create) or `updated/updatedBy` (update) onto write payloads. */
export function withAudit<T extends Record<string, unknown>>(
  data: T,
  mode: AuditMode,
  actorUid?: string | null
): T & Record<string, unknown> {
  const uid = actorUid ?? auth.currentUser?.uid ?? null;

  if (mode === "create") {
    return { ...data, created: serverTimestamp(), createdBy: uid };
  }
  return { ...data, updated: serverTimestamp(), updatedBy: uid };
}
