import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const callStatuses = [
  "ringing",
  "accepted",
  "declined",
  "connected",
  "ended",
  "missed",
  "failed",
] as const;

const callTypes = ["video", "audio"] as const;

const endReasons = [
  "hangup",
  "declined",
  "timeout",
  "ice-failed",
  "error",
] as const;

const sessionDescriptionSchema = z
  .object({
    type: z.string(),
    sdp: z.string(),
  })
  .nullable()
  .optional()
  .transform((v) => v ?? null);

export const callDocSchema = z
  .object({
    _id: z.string(),
    appointmentId: z.string(),
    doctorUserId: z.string(),
    patientUserId: z.string(),
    participantUids: z.array(z.string()).min(1),
    callerUid: z.string(),
    calleeUid: z.string(),
    doctorName: z.string().nullable().optional().transform((v) => v ?? null),
    patientName: z.string().nullable().optional().transform((v) => v ?? null),
    callType: z.enum(callTypes),
    status: z.enum(callStatuses),
    offer: sessionDescriptionSchema,
    answer: sessionDescriptionSchema,
    startedAt: timestampSchema,
    endedAt: timestampSchema,
    durationSeconds: z
      .number()
      .nullable()
      .optional()
      .transform((v) => (typeof v === "number" ? v : null)),
    endedBy: z.string().nullable().optional().transform((v) => v ?? null),
    endReason: z
      .enum(endReasons)
      .nullable()
      .optional()
      .transform((v) => v ?? null),
  })
  .merge(auditFieldsSchema);

export type CallDoc = z.infer<typeof callDocSchema>;

export const iceCandidateDocSchema = z.object({
  _id: z.string(),
  candidate: z.string(),
  sdpMid: z.string().nullable().optional().transform((v) => v ?? null),
  sdpMLineIndex: z
    .number()
    .nullable()
    .optional()
    .transform((v) => (typeof v === "number" ? v : null)),
  usernameFragment: z
    .string()
    .nullable()
    .optional()
    .transform((v) => v ?? null),
});

export type IceCandidateDoc = z.infer<typeof iceCandidateDocSchema>;
