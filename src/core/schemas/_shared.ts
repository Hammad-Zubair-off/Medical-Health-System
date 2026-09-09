import { z } from "zod";
import { Timestamp } from "firebase/firestore";
import type { QueryDocumentSnapshot, DocumentSnapshot } from "firebase/firestore";

/** Accepts a Firestore Timestamp, a Date, or null/undefined (never throws on shape). */
export const timestampSchema = z
  .custom<Timestamp | Date | null>((val) => {
    return (
      val === null ||
      val === undefined ||
      val instanceof Timestamp ||
      val instanceof Date
    );
  })
  .nullable()
  .optional()
  .transform((val) => val ?? null);

/** Audit fields written by `withAudit()`. Lenient — legacy docs may lack any of these. */
export const auditFieldsSchema = z.object({
  created: timestampSchema,
  createdBy: z.string().nullable().optional().transform((v) => v ?? null),
  updated: timestampSchema,
  updatedBy: z.string().nullable().optional().transform((v) => v ?? null),
});

export type AuditFields = z.infer<typeof auditFieldsSchema>;

/**
 * Parse a Firestore document with a lenient (doc-read) schema. Logs and returns
 * `null` instead of throwing, so one malformed record never blanks an entire list.
 */
export function parseDoc<T>(
  schema: z.ZodType<T>,
  snapshot: QueryDocumentSnapshot | DocumentSnapshot,
  context?: string
): T | null {
  if (!snapshot.exists()) return null;

  const result = schema.safeParse({ _id: snapshot.id, ...snapshot.data() });
  if (!result.success) {
    console.error(
      `[parseDoc] Skipping invalid document ${context ?? ""} ${snapshot.ref.path}:`,
      result.error.flatten()
    );
    return null;
  }
  return result.data;
}
