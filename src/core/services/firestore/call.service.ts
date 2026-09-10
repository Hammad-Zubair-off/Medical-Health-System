import {
  addDoc,
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
  startAfter,
  updateDoc,
  where,
  type DocumentReference,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  callDocSchema,
  iceCandidateDocSchema,
  type CallDoc,
  type IceCandidateDoc,
} from "../../schemas/call.schema";
import { parseDoc } from "../../schemas/_shared";
import { withAudit } from "./_helpers";
import { getPatient } from "./patient.service";
import type {
  CallEndReason,
  CallParticipantRole,
  CallStatus,
  CallType,
  ListMyCallsResult,
  SessionDescriptionPayload,
} from "../../types/call.types";

const CALLS = "Call";
const APPOINTMENTS = "Appointment";
const CALLER_CANDIDATES = "callerCandidates";
const CALLEE_CANDIDATES = "calleeCandidates";

const TERMINAL: ReadonlySet<CallStatus> = new Set([
  "ended",
  "declined",
  "missed",
  "failed",
]);

const TRANSITIONS: Record<CallStatus, readonly CallStatus[]> = {
  ringing: ["accepted", "declined", "missed", "failed", "ended"],
  accepted: ["connected", "ended", "failed"],
  connected: ["ended", "failed"],
  declined: [],
  ended: [],
  missed: [],
  failed: [],
};

export function canTransition(from: CallStatus, to: CallStatus): boolean {
  if (from === to) return false;
  if (TERMINAL.has(from)) return false;
  if (to === "failed") return !TERMINAL.has(from);
  return TRANSITIONS[from].includes(to);
}

function refToUid(ref: DocumentReference | string | null | undefined): string | null {
  if (!ref) return null;
  if (typeof ref === "string") {
    const parts = ref.split("/");
    return parts[parts.length - 1] || ref;
  }
  if (typeof ref === "object" && "id" in ref) return ref.id;
  return null;
}

function callRef(callId: string) {
  return doc(db, CALLS, callId);
}

function candidatesCol(callId: string, role: CallParticipantRole) {
  const name = role === "caller" ? CALLER_CANDIDATES : CALLEE_CANDIDATES;
  return collection(db, CALLS, callId, name);
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
    patientName:
      typeof data.patientsName === "string" ? data.patientsName : null,
  };
}

export async function getCall(callId: string): Promise<CallDoc | null> {
  if (!callId) return null;
  return parseDoc(callDocSchema, await getDoc(callRef(callId)), "Call");
}

export async function createCall(
  appointmentId: string,
  callerUid: string,
  callType: CallType = "video"
): Promise<CallDoc> {
  if (!appointmentId) throw new Error("Appointment id is required");
  if (!callerUid) throw new Error("Not signed in");

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
      "This patient has no account — video call unavailable."
    );
  }
  if (!patientId) throw new Error("Appointment has no patient");

  if (callerUid !== doctorUserId && callerUid !== patientUserId) {
    throw new Error("Only the appointed doctor or patient can start this call");
  }

  const calleeUid =
    callerUid === doctorUserId ? patientUserId : doctorUserId;

  const payload = withAudit(
    {
      appointmentId,
      doctorUserId,
      patientUserId,
      participantUids: [doctorUserId, patientUserId],
      callerUid,
      calleeUid,
      doctorName: appointment.doctorName,
      patientName: appointment.patientName,
      callType,
      status: "ringing" as CallStatus,
      offer: null,
      answer: null,
      startedAt: null,
      endedAt: null,
      durationSeconds: null,
      endedBy: null,
      endReason: null,
    },
    "create",
    callerUid
  );

  const ref = doc(collection(db, CALLS));
  await setDoc(ref, payload);

  // Prefer a fresh read; fall back to a local shape if get is briefly denied.
  const created = await getCall(ref.id);
  if (created) return created;
  return {
    _id: ref.id,
    appointmentId,
    doctorUserId,
    patientUserId,
    participantUids: [doctorUserId, patientUserId],
    callerUid,
    calleeUid,
    doctorName: appointment.doctorName,
    patientName: appointment.patientName,
    callType,
    status: "ringing",
    offer: null,
    answer: null,
    startedAt: null,
    endedAt: null,
    durationSeconds: null,
    endedBy: null,
    endReason: null,
    created: new Date(),
    createdBy: callerUid,
    updated: null,
    updatedBy: null,
  };
}

const ACTIVE_CALL_STATUSES: ReadonlySet<CallStatus> = new Set([
  "ringing",
  "accepted",
  "connected",
]);

/** Latest non-terminal call for an appointment that this user can access. */
export async function findActiveCallForAppointment(
  appointmentId: string,
  uid: string
): Promise<CallDoc | null> {
  if (!appointmentId || !uid) return null;
  try {
    // Query must include participantUids so Firestore rules allow the list.
    const snap = await getDocs(
      query(
        collection(db, CALLS),
        where("participantUids", "array-contains", uid),
        orderBy("created", "desc"),
        limit(25)
      )
    );
    for (const d of snap.docs) {
      const call = parseDoc(callDocSchema, d, "Call");
      if (
        call &&
        call.appointmentId === appointmentId &&
        ACTIVE_CALL_STATUSES.has(call.status)
      ) {
        return call;
      }
    }
  } catch (err) {
    console.error("[findActiveCallForAppointment]", err);
  }
  return null;
}

/**
 * Join an in-progress call for this appointment, or start a new ringing call.
 * Prevents doctor + patient each creating a separate call from "Join video call".
 */
export async function startOrJoinCall(
  appointmentId: string,
  uid: string,
  callType: CallType = "video"
): Promise<CallDoc> {
  const existing = await findActiveCallForAppointment(appointmentId, uid);
  if (existing) return existing;
  return createCall(appointmentId, uid, callType);
}

export function subscribeCall(
  callId: string,
  onChange: (call: CallDoc | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!callId) {
    onChange(null);
    return () => undefined;
  }
  return onSnapshot(
    callRef(callId),
    (snap) => {
      onChange(parseDoc(callDocSchema, snap, "Call"));
    },
    (err) => onError?.(err instanceof Error ? err : new Error(String(err)))
  );
}

export function subscribeIncomingCalls(
  uid: string,
  onChange: (call: CallDoc | null) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!uid) {
    onChange(null);
    return () => undefined;
  }
  // Must use array-contains participantUids so list rules (callParticipant) allow the query.
  const q = query(
    collection(db, CALLS),
    where("participantUids", "array-contains", uid),
    orderBy("created", "desc"),
    limit(25)
  );
  return onSnapshot(
    q,
    (snap) => {
      const ringing = snap.docs
        .map((d) => parseDoc(callDocSchema, d, "Call"))
        .filter(
          (c): c is CallDoc =>
            c !== null && c.status === "ringing" && c.calleeUid === uid
        );
      onChange(ringing[0] ?? null);
    },
    (err) => {
      console.error("[subscribeIncomingCalls]", err);
      onError?.(err instanceof Error ? err : new Error(String(err)));
    }
  );
}

export async function setOffer(
  callId: string,
  offer: SessionDescriptionPayload,
  actorUid?: string
): Promise<void> {
  await updateDoc(
    callRef(callId),
    withAudit({ offer }, "update", actorUid)
  );
}

export async function setAnswer(
  callId: string,
  answer: SessionDescriptionPayload,
  actorUid?: string
): Promise<void> {
  await updateDoc(
    callRef(callId),
    withAudit({ answer }, "update", actorUid)
  );
}

export async function addIceCandidate(
  callId: string,
  role: CallParticipantRole,
  candidate: RTCIceCandidateInit
): Promise<void> {
  await addDoc(candidatesCol(callId, role), {
    candidate: candidate.candidate ?? "",
    sdpMid: candidate.sdpMid ?? null,
    sdpMLineIndex:
      typeof candidate.sdpMLineIndex === "number"
        ? candidate.sdpMLineIndex
        : null,
    usernameFragment: candidate.usernameFragment ?? null,
  });
}

export function subscribeIceCandidates(
  callId: string,
  role: CallParticipantRole,
  onAdd: (candidate: IceCandidateDoc) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  return onSnapshot(
    candidatesCol(callId, role),
    (snap) => {
      for (const change of snap.docChanges()) {
        if (change.type !== "added") continue;
        const parsed = parseDoc(
          iceCandidateDocSchema,
          change.doc,
          "IceCandidate"
        );
        if (parsed) onAdd(parsed);
      }
    },
    (err) => onError?.(err instanceof Error ? err : new Error(String(err)))
  );
}

export async function updateCallStatus(
  callId: string,
  status: CallStatus,
  extra: Partial<{
    startedAt: ReturnType<typeof serverTimestamp> | null;
    endedAt: ReturnType<typeof serverTimestamp> | null;
    durationSeconds: number | null;
    endedBy: string | null;
    endReason: CallEndReason | null;
  }> = {},
  actorUid?: string
): Promise<void> {
  const current = await getCall(callId);
  if (!current) throw new Error("Call not found");
  if (!canTransition(current.status, status)) {
    throw new Error(`Invalid call transition ${current.status} → ${status}`);
  }
  await updateDoc(
    callRef(callId),
    withAudit({ status, ...extra }, "update", actorUid)
  );
}

export async function endCall(
  callId: string,
  endedBy: string,
  reason: CallEndReason
): Promise<void> {
  const current = await getCall(callId);
  if (!current) return;
  if (TERMINAL.has(current.status)) return;

  let next: CallStatus = "ended";
  if (reason === "declined" && current.status === "ringing") next = "declined";
  else if (reason === "timeout" && current.status === "ringing") next = "missed";
  else if (reason === "ice-failed" || reason === "error") next = "failed";

  if (!canTransition(current.status, next)) {
    if (canTransition(current.status, "ended")) next = "ended";
    else return;
  }

  let durationSeconds: number | null = null;
  if (current.startedAt) {
    const started =
      current.startedAt instanceof Date
        ? current.startedAt
        : typeof (current.startedAt as { toDate?: () => Date }).toDate ===
            "function"
          ? (current.startedAt as { toDate: () => Date }).toDate()
          : null;
    if (started) {
      durationSeconds = Math.max(
        0,
        Math.round((Date.now() - started.getTime()) / 1000)
      );
    }
  }

  await updateDoc(
    callRef(callId),
    withAudit(
      {
        status: next,
        endedAt: serverTimestamp(),
        durationSeconds,
        endedBy,
        endReason: reason,
      },
      "update",
      endedBy
    )
  );
}

export async function listMyCalls(
  uid: string,
  pageSize = 30,
  cursor: string | null = null
): Promise<ListMyCallsResult> {
  if (!uid) return { calls: [], nextCursor: null };
  const constraints: QueryConstraint[] = [
    where("participantUids", "array-contains", uid),
    orderBy("created", "desc"),
  ];
  if (cursor) {
    const cursorSnap = await getDoc(callRef(cursor));
    if (cursorSnap.exists()) {
      constraints.push(startAfter(cursorSnap));
    }
  }
  constraints.push(limit(pageSize));
  const snap = await getDocs(query(collection(db, CALLS), ...constraints));
  const calls = snap.docs
    .map((d) => parseDoc(callDocSchema, d, "Call"))
    .filter((c): c is CallDoc => c !== null);
  const nextCursor =
    snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null;
  return { calls, nextCursor };
}

export async function listCallsForAppointment(
  appointmentId: string,
  pageSize = 20
): Promise<CallDoc[]> {
  if (!appointmentId) return [];
  const snap = await getDocs(
    query(
      collection(db, CALLS),
      where("appointmentId", "==", appointmentId),
      orderBy("created", "desc"),
      limit(pageSize)
    )
  );
  return snap.docs
    .map((d) => parseDoc(callDocSchema, d, "Call"))
    .filter((c): c is CallDoc => c !== null);
}

export { TERMINAL as CALL_TERMINAL_STATUSES };
