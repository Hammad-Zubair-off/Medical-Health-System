import { z } from "zod";
import { auditFieldsSchema, timestampSchema } from "./_shared";

const senderRoles = ["doctor", "patient"] as const;

export const chatThreadDocSchema = z
  .object({
    _id: z.string(),
    appointmentId: z.string(),
    doctorUserId: z.string(),
    patientUserId: z.string(),
    patientId: z.string(),
    doctorName: z.string().nullable().optional().transform((v) => v ?? null),
    patientName: z.string().nullable().optional().transform((v) => v ?? null),
    participantUids: z.array(z.string()).min(1),
    lastMessage: z.string().nullable().optional().transform((v) => v ?? null),
    lastMessageAt: timestampSchema,
    lastSenderUid: z.string().nullable().optional().transform((v) => v ?? null),
    unreadByUid: z
      .record(z.string(), z.number())
      .nullable()
      .optional()
      .transform((v) => v ?? {}),
  })
  .merge(auditFieldsSchema);

export type ChatThreadDoc = z.infer<typeof chatThreadDocSchema>;

export const chatMessageDocSchema = z.object({
  _id: z.string(),
  text: z.string(),
  senderUid: z.string(),
  senderRole: z.enum(senderRoles),
  createdAt: timestampSchema,
  readBy: z
    .array(z.string())
    .nullable()
    .optional()
    .transform((v) => v ?? []),
});

export type ChatMessageDoc = z.infer<typeof chatMessageDocSchema>;
