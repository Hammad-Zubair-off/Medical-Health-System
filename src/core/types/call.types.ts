import type { Timestamp } from "firebase/firestore";

export type CallType = "video" | "audio";

export type CallStatus =
  | "ringing"
  | "accepted"
  | "declined"
  | "connected"
  | "ended"
  | "missed"
  | "failed";

export type CallEndReason =
  | "hangup"
  | "declined"
  | "timeout"
  | "ice-failed"
  | "error";

export type CallParticipantRole = "caller" | "callee";

export interface SessionDescriptionPayload {
  type: string;
  sdp: string;
}

/** `Call/{callId}` — one live or historical call for an appointment. */
export interface CallDoc {
  _id: string;
  appointmentId: string;
  doctorUserId: string;
  patientUserId: string;
  participantUids: string[];
  callerUid: string;
  calleeUid: string;
  doctorName: string | null;
  patientName: string | null;
  callType: CallType;
  status: CallStatus;
  offer: SessionDescriptionPayload | null;
  answer: SessionDescriptionPayload | null;
  startedAt: Timestamp | Date | null;
  endedAt: Timestamp | Date | null;
  durationSeconds: number | null;
  endedBy: string | null;
  endReason: CallEndReason | null;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

export interface IceCandidateDoc {
  _id: string;
  candidate: string;
  sdpMid: string | null;
  sdpMLineIndex: number | null;
  usernameFragment?: string | null;
}

export interface CreateCallResult {
  call: CallDoc;
}

export interface ListMyCallsResult {
  calls: CallDoc[];
  nextCursor: string | null;
}
