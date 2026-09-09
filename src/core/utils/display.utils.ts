import { toDate } from "./firestore.utils";
import type { PatientAddress } from "../types/patient.types";

/** Locale date like `30 Apr 2025`, or an em dash if missing. */
export function formatDate(
  value: Date | { toDate: () => Date } | null | undefined
): string {
  const date = toDate(value as Date | null | undefined);
  if (!date) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ageFromDob(
  value: Date | { toDate: () => Date } | null | undefined
): number | null {
  const date = toDate(value as Date | null | undefined);
  if (!date) return null;
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDelta = today.getMonth() - date.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < date.getDate())) {
    age -= 1;
  }
  return age;
}

export function formatGenderAge(
  gender: string | null | undefined,
  dob: Date | { toDate: () => Date } | null | undefined
): string {
  const age = ageFromDob(dob);
  const label = gender
    ? gender.charAt(0).toUpperCase() + gender.slice(1)
    : null;
  if (age != null && label) return `${age}, ${label}`;
  if (label) return label;
  if (age != null) return String(age);
  return "—";
}

export function formatAddress(address: PatientAddress | null | undefined): string {
  if (!address) return "—";
  const cityLine = [address.city, address.state, address.country]
    .filter(Boolean)
    .join(", ");
  return cityLine || address.line1 || "—";
}

export function formatFullAddress(address: PatientAddress | null | undefined): string {
  if (!address) return "—";
  return [address.line1, address.line2, address.city, address.state, address.country, address.postalCode]
    .filter(Boolean)
    .join(", ");
}
