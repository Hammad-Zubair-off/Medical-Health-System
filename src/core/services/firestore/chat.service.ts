import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  writeBatch,
  type DocumentReference,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  chatMessageDocSchema,
  chatThreadDocSchema,
  type ChatMessageDoc,
  type ChatThreadDoc,
} from "../../schemas/chat.schema";
import { parseDoc } from "../../schemas/_shared";
import { withAudit } from "./_helpers";
import { getPatient } from "./patient.service";
import type { ChatSenderRole, SendChatMessageInput } from "../../types/chat.types";

const THREADS = "ChatThread";
const MESSAGES = "messages";
const APPOINTMENTS = "Appointment";
const MAX_TEXT = 2000;

function refToUid(ref: DocumentReference | string | null | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") {
    const parts = ref.split("/");
    return parts[parts.length - 1] || ref;
  }
  if (typeof ref === "object" && "id" in ref) return ref.id;
  return null;
}

function threadRef(appointmentId: string) {
  return doc(db, THREADS, appointmentId);
}

function messagesCol(appointmentId: string) {
  return collection(db, THREADS, appointmentId, MESSAGES);
}

async function loadAppointmentRaw(appointmentId: string): Promise<{
  doctorUserId: string | null;
  patientUserId: string | null;
  patientId: string | null;
  doctorName: string | null;
  patientName: string | null;
} | null> {
  const snap = await getDoc(doc(db, APPOINTMENTS, appointmentId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    doctorUserId: refToUid(
      data.doctorUserId as DocumentReference | string | null | undefined
    ),
    patientUserId: refToUid(
      data.UserPatientID as DocumentReference | string | null | undefined
    ),
    patientId: typeof data.patientId === "string" ? data.patientId : null,
    doctorName: typeof data.DoctorsName === "string" ? data.DoctorsName : null,
    patientName: typeof data.patientsName === "string" ? data.patientsName : null,
  };
}

export async function getChatThread(
  appointmentId: string
): Promise<ChatThreadDoc | null> {
  if (!appointmentId) return null;
  try {
    const snap = await getDoc(threadRef(appointmentId));
    if (!snap.exists()) return null;
    return parseDoc(chatThreadDocSchema, snap, "ChatThread");
  } catch (err: unknown) {
    // Older rules deny get on missing docs as permission-denied; treat as absent
    // so ensureThread can create. Unauthorized existing threads still fail on write.
    const code =
      typeof err === "object" && err !== null && "code" in err
        ? String((err as { code: unknown }).code)
        : "";
    if (code === "permission-denied") return null;
    throw err;
  }
}

/**
 * Create (or return) a chat thread for an appointment.
 * Requires a linked patient login (`UserPatientID` / Patient.userId).
 * Actor must be the appointment doctor, the patient, or an admin (admin create allowed for seed/support tooling via rules separately — client still validates participant).
 */
export async function ensureThreadForAppointment(
  appointmentId: string,
  actorUid: string
): Promise<ChatThreadDoc> {
  if (!appointmentId) throw new Error("Appointment id is required");
  if (!actorUid) throw new Error("Not signed in");

  const existing = await getChatThread(appointmentId);
  if (existing) return existing;

  const appointment = await loadAppointmentRaw(appointmentId);
  if (!appointment) throw new Error("Appointment not found");

  const doctorUserId = appointment.doctorUserId;
  if (!doctorUserId) throw new Error("Appointment has no doctor user");

  let patientUserId = appointment.patientUserId;
  const patientId = appointment.patientId;
  if (!patientUserId && patientId) {
    const patient = await getPatient(patientId);
    patientUserId = patient?.userId ?? null;
  }
  if (!patientUserId) {
    throw new Error(
      "Patient has no login — chat unavailable for walk-in patients"
    );
  }
  if (!patientId) throw new Error("Appointment has no patient");

  if (actorUid !== doctorUserId && actorUid !== patientUserId) {
    throw new Error("Only the appointed doctor or patient can start this chat");
  }

  const payload = withAudit(
    {
      appointmentId,
      doctorUserId,
      patientUserId,
      patientId,
      doctorName: appointment.doctorName,
      patientName: appointment.patientName,
      participantUids: [doctorUserId, patientUserId],
      lastMessage: null,
      lastMessageAt: serverTimestamp(),
      lastSenderUid: null,
      unreadByUid: {
        [doctorUserId]: 0,
        [patientUserId]: 0,
      },
    },
    "create",
    actorUid
  );

  await setDoc(threadRef(appointmentId), payload);
  const created = await getChatThread(appointmentId);
  if (!created) throw new Error("Failed to create chat thread");
  return created;
}

export async function listMyThreads(
  uid: string,
  pageSize = 50
): Promise<ChatThreadDoc[]> {
  if (!uid) return [];
  const snap = await getDocs(
    query(
      collection(db, THREADS),
      where("participantUids", "array-contains", uid),
      orderBy("lastMessageAt", "desc"),
      limit(pageSize)
    )
  );
  return snap.docs
    .map((d) => parseDoc(chatThreadDocSchema, d, "ChatThread"))
    .filter((t): t is ChatThreadDoc => t !== null);
}

/** Live inbox for sidebar badges + Messages list. */
export function subscribeMyThreads(
  uid: string,
  onChange: (threads: ChatThreadDoc[]) => void,
  onError?: (err: Error) => void,
  pageSize = 50
): Unsubscribe {
  if (!uid) {
    onChange([]);
    return () => undefined;
  }
  const q = query(
    collection(db, THREADS),
    where("participantUids", "array-contains", uid),
    orderBy("lastMessageAt", "desc"),
    limit(pageSize)
  );
  return onSnapshot(
    q,
    (snap) => {
      const threads = snap.docs
        .map((d) => parseDoc(chatThreadDocSchema, d, "ChatThread"))
        .filter((t): t is ChatThreadDoc => t !== null);
      onChange(threads);
    },
    (err) => onError?.(err instanceof Error ? err : new Error(String(err)))
  );
}

export function totalUnreadForUser(
  threads: ChatThreadDoc[],
  uid: string
): number {
  if (!uid) return 0;
  return threads.reduce((sum, t) => {
    const n = t.unreadByUid?.[uid];
    if (typeof n === "number" && n > 0) return sum + Math.floor(n);
    // Legacy threads without unreadByUid: treat as unread if last sender is the other party.
    const hasCounters =
      t.unreadByUid && Object.keys(t.unreadByUid).length > 0;
    if (
      !hasCounters &&
      t.lastMessage &&
      t.lastSenderUid &&
      t.lastSenderUid !== uid
    ) {
      return sum + 1;
    }
    return sum;
  }, 0);
}

/** Admin inbox — recent threads by last activity. */
export async function listAllThreads(pageSize = 50): Promise<ChatThreadDoc[]> {
  const snap = await getDocs(
    query(
      collection(db, THREADS),
      orderBy("lastMessageAt", "desc"),
      limit(pageSize)
    )
  );
  return snap.docs
    .map((d) => parseDoc(chatThreadDocSchema, d, "ChatThread"))
    .filter((t): t is ChatThreadDoc => t !== null);
}

export function subscribeThreadMessages(
  appointmentId: string,
  onChange: (messages: ChatMessageDoc[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(messagesCol(appointmentId), orderBy("createdAt", "asc"));
  return onSnapshot(
    q,
    (snap) => {
      const messages = snap.docs
        .map((d) => parseDoc(chatMessageDocSchema, d, "ChatMessage"))
        .filter((m): m is ChatMessageDoc => m !== null);
      onChange(messages);
    },
    (err) => {
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  );
}

export async function sendMessage(
  appointmentId: string,
  input: SendChatMessageInput
): Promise<string> {
  const text = input.text.trim();
  if (!text) throw new Error("Message cannot be empty");
  if (text.length > MAX_TEXT) {
    throw new Error(`Message must be at most ${MAX_TEXT} characters`);
  }
  if (!input.senderUid) throw new Error("Not signed in");

  const thread = await getChatThread(appointmentId);
  if (!thread) throw new Error("Chat thread not found — open chat from the appointment first");
  if (!thread.participantUids.includes(input.senderUid)) {
    throw new Error("You are not a participant in this chat");
  }

  const recipientUid = thread.participantUids.find((id) => id !== input.senderUid);
  const unreadByUid = { ...(thread.unreadByUid ?? {}) };
  if (recipientUid) {
    unreadByUid[recipientUid] = (unreadByUid[recipientUid] ?? 0) + 1;
  }
  unreadByUid[input.senderUid] = 0;

  const batch = writeBatch(db);
  const msgRef = doc(messagesCol(appointmentId));
  batch.set(msgRef, {
    text,
    senderUid: input.senderUid,
    senderRole: input.senderRole,
    createdAt: serverTimestamp(),
    readBy: [input.senderUid],
  });
  batch.update(
    threadRef(appointmentId),
    withAudit(
      {
        lastMessage: text.slice(0, 200),
        lastMessageAt: serverTimestamp(),
        lastSenderUid: input.senderUid,
        unreadByUid,
      },
      "update",
      input.senderUid
    )
  );
  await batch.commit();
  return msgRef.id;
}

export async function markThreadRead(
  appointmentId: string,
  uid: string
): Promise<void> {
  if (!appointmentId || !uid) return;
  const thread = await getChatThread(appointmentId);
  if (!thread || !thread.participantUids.includes(uid)) return;

  const snap = await getDocs(
    query(messagesCol(appointmentId), orderBy("createdAt", "desc"), limit(40))
  );
  const batch = writeBatch(db);
  let ops = 0;
  for (const d of snap.docs) {
    const data = d.data();
    const readBy = Array.isArray(data.readBy) ? (data.readBy as string[]) : [];
    if (!readBy.includes(uid)) {
      batch.update(d.ref, { readBy: arrayUnion(uid) });
      ops += 1;
    }
  }
  const unreadByUid = { ...(thread.unreadByUid ?? {}), [uid]: 0 };
  batch.update(
    threadRef(appointmentId),
    withAudit({ unreadByUid }, "update", uid)
  );
  ops += 1;
  if (ops > 0) await batch.commit();
}

export type { ChatSenderRole };
