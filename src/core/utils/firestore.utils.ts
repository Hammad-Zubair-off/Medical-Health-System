import { Timestamp } from "firebase/firestore";

/**
 * Shared Firestore value coercion helpers.
 *
 * The same `x instanceof Timestamp ? x.toDate() : x instanceof Date ? x : …`
 * ladder was copy-pasted across `admin`, `appointments`, `doctor` services and
 * `useDoctorDashboard`. This is the single source of truth going forward.
 */

/** Coerce a Firestore Timestamp/Date/undefined into a Date, or null if absent/invalid. */
export function toDate(value: Timestamp | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  return null;
}

/** Coerce a Firestore Timestamp/Date/undefined into epoch millis, or null if absent/invalid. */
export function toMillis(value: Timestamp | Date | null | undefined): number | null {
  const date = toDate(value);
  return date ? date.getTime() : null;
}

/** Coerce a Date/Timestamp into a Firestore Timestamp. Passing a Timestamp is a no-op. */
export function toTimestamp(value: Timestamp | Date | null | undefined): Timestamp | null {
  if (!value) return null;
  if (value instanceof Timestamp) return value;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : Timestamp.fromDate(value);
  }
  return null;
}

/** Lowercased, trimmed string for building `*Lower` prefix-search fields. */
export function toLowerSearchField(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}
