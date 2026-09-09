import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { paymentDocSchema, type PaymentDoc } from "../../schemas/payment.schema";
import { parseDoc } from "../../schemas/_shared";
import { toTimestamp } from "../../utils/firestore.utils";
import { parseLocalDateInput } from "../../utils/report.utils";
import { addMinor, toMinor, type MinorUnits } from "../../utils/money.utils";
import { withAudit } from "./_helpers";
import { getInvoice, recordPaymentSideEffects } from "./invoice.service";
import type {
  ListPaymentsParams,
  ListPaymentsResult,
  PaymentFormValues,
  PaymentStatus,
} from "../../types/payment.types";

const COLLECTION = "Payment";
const DEFAULT_PAGE_SIZE = 20;

export async function listPayments(
  params: ListPaymentsParams = {}
): Promise<ListPaymentsResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.invoiceId) {
    constraints.push(where("invoiceId", "==", params.invoiceId));
  }
  if (params.patientId) {
    constraints.push(where("patientId", "==", params.patientId));
  }
  if (params.patientUserId) {
    constraints.push(where("patientUserId", "==", params.patientUserId));
  }
  if (params.status) {
    constraints.push(where("status", "==", params.status));
  }
  constraints.push(orderBy("paidOn", "desc"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }

  constraints.push(limit(pageSize));
  const snap = await getDocs(query(ref, ...constraints));
  const payments = snap.docs
    .map((d) => parseDoc(paymentDocSchema, d, "Payment"))
    .filter((p): p is PaymentDoc => p !== null);

  return {
    payments: payments as unknown as ListPaymentsResult["payments"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getPaymentsByInvoice(
  invoiceId: string
): Promise<PaymentDoc[]> {
  if (!invoiceId) return [];
  const snap = await getDocs(
    query(
      collection(db, COLLECTION),
      where("invoiceId", "==", invoiceId),
      orderBy("paidOn", "desc"),
      limit(100)
    )
  );
  return snap.docs
    .map((d) => parseDoc(paymentDocSchema, d, "Payment"))
    .filter((p): p is PaymentDoc => p !== null);
}

function sumCompletedPayments(
  payments: Array<{ amount: number; status: string }>
): MinorUnits {
  return addMinor(
    ...payments
      .filter((p) => p.status === "completed")
      .map((p) => Math.round(p.amount || 0))
  );
}

/**
 * Create a payment, then recompute invoice amountPaid / balance / status from
 * the sum of completed payments (sequential — Firestore client transactions
 * cannot run collection queries).
 */
export async function createPayment(
  values: PaymentFormValues,
  actorUid?: string | null
): Promise<string> {
  const invoice = await getInvoice(values.invoiceId);
  if (!invoice) throw new Error("Invoice not found");
  if (invoice.status === "cancelled") {
    throw new Error("Cannot record payment on a cancelled invoice");
  }

  const amount = toMinor(values.amount);
  if (amount <= 0) throw new Error("Payment amount must be greater than zero");

  const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}`;
  const paidOn =
    toTimestamp(parseLocalDateInput(values.paidOn)) ?? toTimestamp(new Date());

  const docRef = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        paymentId,
        invoiceId: values.invoiceId,
        invoiceNumber: invoice.invoiceNumber || null,
        patientId: invoice.patientId,
        patientUserId: invoice.patientUserId,
        patientName: invoice.patientName,
        amount,
        method: values.method,
        paidOn,
        reference: values.reference || null,
        notes: values.notes || null,
        status: "completed" as PaymentStatus,
      },
      "create",
      actorUid
    )
  );

  // Immediate invoice update from known totals (do not depend solely on re-query).
  const provisionalPaid = (invoice.amountPaid ?? 0) + amount;
  await recordPaymentSideEffects(values.invoiceId, provisionalPaid, actorUid);

  // Best-effort consistency pass from all completed payments.
  try {
    const payments = await getPaymentsByInvoice(values.invoiceId);
    const amountPaid = sumCompletedPayments(payments);
    if (amountPaid !== provisionalPaid) {
      await recordPaymentSideEffects(values.invoiceId, amountPaid, actorUid);
    }
  } catch (err) {
    console.warn(
      "Payment created; invoice updated provisionally but re-sum failed:",
      err
    );
  }

  return docRef.id;
}

/** Soft-cancel a payment and recompute the parent invoice. */
export async function cancelPayment(
  id: string,
  actorUid?: string | null
): Promise<void> {
  const payment = await getDoc(doc(db, COLLECTION, id));
  if (!payment.exists()) throw new Error("Payment not found");
  const data = payment.data();
  const invoiceId = String(data.invoiceId || "");

  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit({ status: "cancelled" as PaymentStatus }, "update", actorUid)
  );

  if (!invoiceId) return;

  const payments = await getPaymentsByInvoice(invoiceId);
  const amountPaid = sumCompletedPayments(payments);
  await recordPaymentSideEffects(invoiceId, amountPaid, actorUid);
}
