import type { Timestamp } from "firebase/firestore";
import type { UserRole } from "./auth.types";

export type ChatSenderRole = Extract<UserRole, "doctor" | "patient">;

/** `ChatThread/{appointmentId}` — one thread per appointment. */
export interface ChatThread {
  _id: string;
  appointmentId: string;
  doctorUserId: string;
  patientUserId: string;
  patientId: string;
  doctorName: string | null;
  patientName: string | null;
  participantUids: string[];
  lastMessage: string | null;
  lastMessageAt: Timestamp | Date | null;
  lastSenderUid: string | null;
  /** Per-participant unread counts (incremented for the recipient on send). */
  unreadByUid: Record<string, number>;
  created: Timestamp | Date | null;
  createdBy: string | null;
  updated: Timestamp | Date | null;
  updatedBy: string | null;
}

/** `ChatThread/{appointmentId}/messages/{messageId}` */
export interface ChatMessage {
  _id: string;
  text: string;
  senderUid: string;
  senderRole: ChatSenderRole;
  createdAt: Timestamp | Date | null;
  readBy: string[];
}

export interface SendChatMessageInput {
  text: string;
  senderUid: string;
  senderRole: ChatSenderRole;
}
