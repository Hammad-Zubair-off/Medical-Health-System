import {
  collection,
  doc,
  endAt,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  startAt,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { invoiceDocSchema, type InvoiceDoc } from "../../schemas/invoice.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField, toTimestamp } from "../../utils/firestore.utils";
import {
  computeBalance,
  computeInvoiceTotals,
  computeLineAmount,
  toMinor,
  type MinorUnits,
} from "../../utils/money.utils";
import { deriveInvoiceStatusFromPayments } from "../../utils/invoice.utils";
import { withAudit } from "./_helpers";
import { allocateInvoiceNumberInTx } from "./counter.service";
import { getClinicSettings } from "./clinic-settings.service";
import { getPatient } from "./patient.service";
import { getDoctorData } from "./doctor.service";
import type {
  InvoiceFormValues,
  InvoiceStatus,
  ListInvoicesParams,
  ListInvoicesResult,
} from "../../types/invoice.types";

export { deriveInvoiceStatusFromPayments } from "../../utils/invoice.utils";

const COLLECTION = "Invoice";
const DEFAULT_PAGE_SIZE = 20;

function taxPercentToBps(percent: number): number {
  return Math.round((Number.isFinite(percent) ? percent : 0) * 100);
}

export function buildInvoiceMoneyFields(values: {
  lineItems: InvoiceFormValues["lineItems"];
  taxRatePercent: number;
  discount: number;
}): {
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: MinorUnits;
    amount: MinorUnits;
  }>;
  taxRate: number;
  subtotal: MinorUnits;
  taxAmount: MinorUnits;
  discount: MinorUnits;
  total: MinorUnits;
  amountPaid: MinorUnits;
  balance: MinorUnits;
} {
  const lineItems = values.lineItems.map((item) => {
    const unitPrice = toMinor(item.unitPrice);
    const amount = computeLineAmount(item.quantity, unitPrice);
    return {
      description: item.description.trim(),
      quantity: item.quantity,
      unitPrice,
      amount,
    };
  });
  const taxRate = taxPercentToBps(values.taxRatePercent);
  const discount = toMinor(values.discount);
  const totals = computeInvoiceTotals({
    lineAmounts: lineItems.map((l) => l.amount),
    taxRateBps: taxRate,
    discountMinor: discount,
  });
  return {
    lineItems,
    taxRate,
    ...totals,
    amountPaid: 0,
    balance: computeBalance(totals.total, 0),
  };
}

export async function listInvoices(
  params: ListInvoicesParams = {}
): Promise<ListInvoicesResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.search) {
    const term = toLowerSearchField(params.search);
    constraints.push(orderBy("patientNameLower"), startAt(term), endAt(term + "\uf8ff"));
  } else {
    if (params.status) constraints.push(where("status", "==", params.status));
    if (params.patientUserId) {
      constraints.push(where("patientUserId", "==", params.patientUserId));
    }
    if (params.patientId) {
      constraints.push(where("patientId", "==", params.patientId));
    }
    if (params.doctorUserId) {
      constraints.push(where("doctorUserId", "==", params.doctorUserId));
    }
    constraints.push(orderBy("issuedOn", "desc"));
  }

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }

  constraints.push(limit(pageSize));
  const snap = await getDocs(query(ref, ...constraints));
  const invoices = snap.docs
    .map((d) => parseDoc(invoiceDocSchema, d, "Invoice"))
    .filter((p): p is InvoiceDoc => p !== null);

  return {
    invoices: invoices as unknown as ListInvoicesResult["invoices"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getInvoice(id: string): Promise<InvoiceDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, COLLECTION, id));
  return parseDoc(invoiceDocSchema, snap, "Invoice");
}

export async function createInvoice(input: {
  values: InvoiceFormValues;
  actorUid?: string | null;
  doctorUserId?: string | null;
  doctorName?: string | null;
}): Promise<string> {
  const patient = await getPatient(input.values.patientId);
  if (!patient) throw new Error("Patient not found");

  let doctorUserId = input.doctorUserId ?? null;
  let doctorName = input.doctorName ?? null;
  let doctorId = input.values.doctorId || null;

  if (doctorId) {
    const doctor = await getDoctorData(doctorId);
    if (doctor) {
      doctorName = doctorName ?? doctor.displayName ?? null;
      // Doctor docs may expose userid as a path string or DocumentReference.
      if (!doctorUserId && doctor.userid) {
        const raw = doctor.userid;
        if (typeof raw === "string") {
          doctorUserId = raw.includes("/") ? raw.split("/").pop() ?? raw : raw;
        } else if (raw && typeof raw === "object" && "id" in (raw as object)) {
          doctorUserId = (raw as { id: string }).id;
        }
      }
    }
  }

  const money = buildInvoiceMoneyFields(input.values);
  const issuedOn = toTimestamp(new Date(input.values.issuedOn)) ?? toTimestamp(new Date());
  let dueDate = input.values.dueDate
    ? toTimestamp(new Date(input.values.dueDate))
    : null;
  if (!dueDate) {
    try {
      const clinic = await getClinicSettings();
      const days = Math.max(0, Math.floor(clinic.invoice.dueDaysDefault || 0));
      if (days > 0 && issuedOn) {
        const base =
          issuedOn instanceof Date
            ? issuedOn
            : (issuedOn as { toDate: () => Date }).toDate?.() ?? new Date();
        const due = new Date(base);
        due.setDate(due.getDate() + days);
        dueDate = toTimestamp(due);
      }
    } catch {
      /* settings optional */
    }
  }

  const invoiceRef = doc(collection(db, COLLECTION));

  await runTransaction(db, async (tx) => {
    const invoiceNumber = await allocateInvoiceNumberInTx(tx);
    tx.set(
      invoiceRef,
      withAudit(
        {
          invoiceNumber,
          appointmentId: input.values.appointmentId || null,
          patientId: patient._id,
          patientUserId: patient.userId,
          patientName: patient.displayName,
          patientNameLower: toLowerSearchField(patient.displayName),
          doctorId,
          doctorUserId,
          doctorName,
          issuedOn,
          dueDate,
          lineItems: money.lineItems,
          subtotal: money.subtotal,
          taxRate: money.taxRate,
          taxAmount: money.taxAmount,
          discount: money.discount,
          total: money.total,
          amountPaid: money.amountPaid,
          balance: money.balance,
          status: input.values.status ?? "sent",
          notes: input.values.notes || null,
        },
        "create",
        input.actorUid
      )
    );
  });

  return invoiceRef.id;
}

export async function updateInvoice(
  id: string,
  values: Partial<InvoiceFormValues>,
  actorUid?: string | null
): Promise<void> {
  const existing = await getInvoice(id);
  if (!existing) throw new Error("Invoice not found");
  if (existing.status === "cancelled") {
    throw new Error("Cannot update a cancelled invoice");
  }

  const payload: Record<string, unknown> = {};

  if (values.notes !== undefined) payload.notes = values.notes || null;
  if (values.status !== undefined) payload.status = values.status;
  if (values.appointmentId !== undefined) {
    payload.appointmentId = values.appointmentId || null;
  }
  if (values.issuedOn !== undefined) {
    payload.issuedOn = toTimestamp(new Date(values.issuedOn));
  }
  if (values.dueDate !== undefined) {
    payload.dueDate = values.dueDate ? toTimestamp(new Date(values.dueDate)) : null;
  }

  if (
    values.lineItems !== undefined ||
    values.taxRatePercent !== undefined ||
    values.discount !== undefined
  ) {
    const money = buildInvoiceMoneyFields({
      lineItems: values.lineItems ??
        existing.lineItems.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unitPrice / 100,
        })),
      taxRatePercent:
        values.taxRatePercent ?? existing.taxRate / 100,
      discount: values.discount ?? existing.discount / 100,
    });
    payload.lineItems = money.lineItems;
    payload.subtotal = money.subtotal;
    payload.taxRate = money.taxRate;
    payload.taxAmount = money.taxAmount;
    payload.discount = money.discount;
    payload.total = money.total;
    payload.balance = computeBalance(money.total, existing.amountPaid);
    payload.status = deriveInvoiceStatusFromPayments(
      money.total,
      existing.amountPaid,
      (values.status as InvoiceStatus | undefined) ?? existing.status
    );
  }

  await updateDoc(doc(db, COLLECTION, id), withAudit(payload, "update", actorUid));
}

/** Soft-cancel only — invoices are never hard-deleted. */
export async function cancelInvoice(
  id: string,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, COLLECTION, id),
    withAudit({ status: "cancelled" as InvoiceStatus }, "update", actorUid)
  );
}

/**
 * Recompute amountPaid / balance / status from completed payments.
 * Called by payment.service after create (and available for repair).
 */
export async function recordPaymentSideEffects(
  invoiceId: string,
  amountPaid: MinorUnits,
  actorUid?: string | null
): Promise<void> {
  const invoice = await getInvoice(invoiceId);
  if (!invoice) throw new Error("Invoice not found");

  const balance = computeBalance(invoice.total, amountPaid);
  const status = deriveInvoiceStatusFromPayments(
    invoice.total,
    amountPaid,
    invoice.status
  );

  await updateDoc(
    doc(db, COLLECTION, invoiceId),
    withAudit({ amountPaid, balance, status }, "update", actorUid)
  );
}
