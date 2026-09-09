import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  startAfter,
  updateDoc,
  where,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  fileFolderDocSchema,
  fileObjectDocSchema,
  type FileFolderDoc,
  type FileObjectDoc,
} from "../../schemas/file.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField } from "../../utils/firestore.utils";
import type {
  CreateFileObjectInput,
  CreateFolderInput,
  ListFilesParams,
  ListFilesResult,
  UpdateFileObjectInput,
} from "../../types/file.types";
import { withAudit } from "./_helpers";

const FILES = "FileObject";
const FOLDERS = "FileFolder";
const DEFAULT_PAGE = 24;

async function cursorSnap(id: string | null | undefined): Promise<DocumentSnapshot | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, FILES, id));
  return snap.exists() ? snap : null;
}

export async function listFiles(
  params: ListFilesParams = {}
): Promise<ListFilesResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE;
  const status = params.status ?? "active";
  const constraints: QueryConstraint[] = [];

  if (params.sharedWithUid) {
    constraints.push(where("sharedWith", "array-contains", params.sharedWithUid));
  } else if (params.appointmentId) {
    constraints.push(where("appointmentId", "==", params.appointmentId));
  } else if (params.patientId) {
    constraints.push(where("patientId", "==", params.patientId));
  } else if (params.ownerUid && params.folderId) {
    constraints.push(where("ownerUid", "==", params.ownerUid));
    constraints.push(where("folderId", "==", params.folderId));
  } else if (params.ownerUid) {
    constraints.push(where("ownerUid", "==", params.ownerUid));
  } else {
    constraints.push(where("status", "==", status));
  }

  constraints.push(orderBy("uploadedAt", "desc"), limit(Math.min(pageSize * 3, 100)));

  const cursor = await cursorSnap(params.cursor);
  if (cursor) constraints.splice(constraints.length - 1, 0, startAfter(cursor));

  const snap = await getDocs(query(collection(db, FILES), ...constraints));
  const parsed = snap.docs
    .map((d) => parseDoc(fileObjectDocSchema, d, FILES))
    .filter((x): x is FileObjectDoc => x !== null)
    // status filtered in memory so we don't need ownerUid+status composites
    .filter((f) => f.status === status);

  const page = parsed.slice(0, pageSize);
  const hasMore = parsed.length > pageSize || snap.docs.length >= pageSize * 3;
  return {
    files: page,
    nextCursor: hasMore && page.length ? page[page.length - 1]._id : null,
  };
}

export async function listSharedWithMe(
  uid: string,
  params: Omit<ListFilesParams, "sharedWithUid" | "ownerUid"> = {}
): Promise<ListFilesResult> {
  return listFiles({ ...params, sharedWithUid: uid });
}

export async function listFilesForAppointment(
  appointmentId: string,
  viewerUid: string,
  params: Omit<ListFilesParams, "appointmentId" | "ownerUid" | "sharedWithUid"> = {}
): Promise<ListFilesResult> {
  if (!appointmentId || !viewerUid) {
    return { files: [], nextCursor: null };
  }
  const pageSize = params.pageSize ?? 50;
  const status = params.status ?? "active";

  // Queries must include ownerUid or sharedWith so they satisfy security rules.
  // A bare appointmentId query is rejected for non-admins.
  const [owned, shared] = await Promise.all([
    listFiles({ ownerUid: viewerUid, pageSize: 100, status }),
    listFiles({ sharedWithUid: viewerUid, pageSize: 100, status }),
  ]);

  const byId = new Map<string, FileObjectDoc>();
  for (const f of [...owned.files, ...shared.files]) {
    if (f.appointmentId === appointmentId) byId.set(f._id, f);
  }

  const files = Array.from(byId.values()).sort((a, b) => {
    const ta =
      a.uploadedAt && typeof a.uploadedAt === "object" && "toMillis" in a.uploadedAt
        ? (a.uploadedAt as { toMillis: () => number }).toMillis()
        : a.uploadedAt instanceof Date
          ? a.uploadedAt.getTime()
          : 0;
    const tb =
      b.uploadedAt && typeof b.uploadedAt === "object" && "toMillis" in b.uploadedAt
        ? (b.uploadedAt as { toMillis: () => number }).toMillis()
        : b.uploadedAt instanceof Date
          ? b.uploadedAt.getTime()
          : 0;
    return tb - ta;
  });

  return {
    files: files.slice(0, pageSize),
    nextCursor: null,
  };
}

export async function getFile(id: string): Promise<FileObjectDoc | null> {
  const snap = await getDoc(doc(db, FILES, id));
  return parseDoc(fileObjectDocSchema, snap, FILES);
}

export async function createFileObject(
  input: CreateFileObjectInput,
  actorUid?: string | null
): Promise<string> {
  const ref = await addDoc(
    collection(db, FILES),
    withAudit(
      {
        fileName: input.fileName,
        fileNameLower: toLowerSearchField(input.fileName),
        publicId: input.publicId,
        secureUrl: input.secureUrl,
        resourceType: input.resourceType,
        format: input.format,
        contentType: input.contentType,
        sizeBytes: Math.floor(Number(input.sizeBytes)) || 0,
        width: input.width ?? null,
        height: input.height ?? null,
        ownerUid: input.ownerUid,
        ownerRole: input.ownerRole,
        sharedWith: input.sharedWith ?? [],
        folderId: input.folderId ?? null,
        appointmentId: input.appointmentId ?? null,
        patientId: input.patientId ?? null,
        doctorId: input.doctorId ?? null,
        description: input.description ?? null,
        status: "active",
        uploadedAt: serverTimestamp(),
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateFile(
  id: string,
  patch: UpdateFileObjectInput,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (patch.fileName !== undefined) {
    payload.fileName = patch.fileName.trim();
    payload.fileNameLower = toLowerSearchField(patch.fileName);
  }
  if (patch.sharedWith !== undefined) payload.sharedWith = patch.sharedWith;
  if (patch.folderId !== undefined) payload.folderId = patch.folderId;
  if (patch.description !== undefined) payload.description = patch.description;
  if (patch.status !== undefined) payload.status = patch.status;
  await updateDoc(doc(db, FILES, id), withAudit(payload, "update", actorUid));
}

export async function softDeleteFile(
  id: string,
  actorUid?: string | null
): Promise<void> {
  await updateFile(id, { status: "deleted" }, actorUid);
}

/** Soft quota helper — sums active sizeBytes for owner. Paginated batches. */
export async function getUserStorageUsage(uid: string): Promise<number> {
  let total = 0;
  let cursor: string | null = null;
  for (let i = 0; i < 20; i++) {
    const page = await listFiles({
      ownerUid: uid,
      status: "active",
      pageSize: 100,
      cursor,
    });
    for (const f of page.files) total += f.sizeBytes || 0;
    if (!page.nextCursor) break;
    cursor = page.nextCursor;
  }
  return total;
}

export async function createFolder(
  input: CreateFolderInput,
  actorUid?: string | null
): Promise<string> {
  const name = input.name.trim();
  const ref = await addDoc(
    collection(db, FOLDERS),
    withAudit(
      {
        name,
        nameLower: toLowerSearchField(name),
        ownerUid: input.ownerUid,
        parentFolderId: input.parentFolderId ?? null,
        status: "active",
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function listFolders(ownerUid: string): Promise<FileFolderDoc[]> {
  const snap = await getDocs(
    query(
      collection(db, FOLDERS),
      where("ownerUid", "==", ownerUid),
      orderBy("nameLower"),
      limit(100)
    )
  );
  return snap.docs
    .map((d) => parseDoc(fileFolderDocSchema, d, FOLDERS))
    .filter((x): x is FileFolderDoc => x !== null)
    .filter((f) => f.status === "active");
}

export async function softDeleteFolder(
  id: string,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, FOLDERS, id),
    withAudit({ status: "deleted" }, "update", actorUid)
  );
}

export async function renameFolder(
  id: string,
  name: string,
  actorUid?: string | null
): Promise<void> {
  const trimmed = name.trim();
  await updateDoc(
    doc(db, FOLDERS, id),
    withAudit(
      { name: trimmed, nameLower: toLowerSearchField(trimmed) },
      "update",
      actorUid
    )
  );
}
