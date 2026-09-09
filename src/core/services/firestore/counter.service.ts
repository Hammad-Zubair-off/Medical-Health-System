import { doc, runTransaction, type Transaction } from "firebase/firestore";
import { db } from "../../../firebase";
import { CLINIC_SETTINGS_DOC_ID } from "./clinic-settings.service";

const COUNTER_COLLECTION = "Counter";
const INVOICE_COUNTER_ID = "invoice";
const SETTINGS_COLLECTION = "ClinicSettings";

/** Format a counter value as `{prefix}-0001`. Exported for seed / tests. */
export function formatInvoiceNumber(n: number, prefix = "INV"): string {
  const clean = (prefix || "INV").trim().toUpperCase().replace(/[^A-Z0-9]/g, "") || "INV";
  return `${clean}-${String(n).padStart(4, "0")}`;
}

/**
 * Allocate an invoice number inside an existing transaction (so createInvoice
 * can bump the counter and write the Invoice doc atomically).
 * Reads invoice prefix from ClinicSettings/main in the same transaction.
 */
export async function allocateInvoiceNumberInTx(tx: Transaction): Promise<string> {
  const settingsRef = doc(db, SETTINGS_COLLECTION, CLINIC_SETTINGS_DOC_ID);
  const settingsSnap = await tx.get(settingsRef);
  const prefix =
    settingsSnap.exists() &&
    typeof (settingsSnap.data() as { invoice?: { prefix?: string } }).invoice?.prefix ===
      "string"
      ? String((settingsSnap.data() as { invoice: { prefix: string } }).invoice.prefix)
      : "INV";

  const ref = doc(db, COUNTER_COLLECTION, INVOICE_COUNTER_ID);
  const snap = await tx.get(ref);
  const next = snap.exists()
    ? Number((snap.data() as { next?: number }).next ?? 1)
    : 1;
  const safeNext = Number.isFinite(next) && next > 0 ? Math.floor(next) : 1;
  tx.set(ref, { next: safeNext + 1 }, { merge: true });
  return formatInvoiceNumber(safeNext, prefix);
}

/**
 * Atomically allocate the next invoice number from `Counter/invoice`.
 * Two concurrent callers never receive the same number.
 */
export async function allocateInvoiceNumber(): Promise<string> {
  return runTransaction(db, (tx) => allocateInvoiceNumberInTx(tx));
}
