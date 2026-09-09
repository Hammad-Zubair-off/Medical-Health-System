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
import { payrollDocSchema, type PayrollDoc } from "../../schemas/payroll.schema";
import { parseDoc } from "../../schemas/_shared";
import { toTimestamp } from "../../utils/firestore.utils";
import { computeNetPay, toMinor } from "../../utils/money.utils";
import { withAudit } from "./_helpers";
import { getStaff } from "./staff.service";
import type {
  ListPayrollParams,
  ListPayrollResult,
  PayrollFormValues,
  PayrollStatus,
} from "../../types/payroll.types";

const COLLECTION = "Payroll";
const DEFAULT_PAGE_SIZE = 20;

export async function listPayroll(
  params: ListPayrollParams = {}
): Promise<ListPayrollResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const constraints: QueryConstraint[] = [];

  if (params.staffId) constraints.push(where("staffId", "==", params.staffId));
  if (params.staffUserId) {
    constraints.push(where("staffUserId", "==", params.staffUserId));
  }
  if (params.status) constraints.push(where("status", "==", params.status));
  constraints.push(orderBy("periodStart", "desc"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }
  constraints.push(limit(pageSize));

  const snap = await getDocs(query(collection(db, COLLECTION), ...constraints));
  const payrolls = snap.docs
    .map((d) => parseDoc(payrollDocSchema, d, "Payroll"))
    .filter((p): p is PayrollDoc => p !== null);

  return {
    payrolls: payrolls as unknown as ListPayrollResult["payrolls"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getPayroll(id: string): Promise<PayrollDoc | null> {
  if (!id) return null;
  return parseDoc(payrollDocSchema, await getDoc(doc(db, COLLECTION, id)), "Payroll");
}

function toLineItemsMinor(
  items: Array<{ label: string; amount: number }>
): Array<{ label: string; amount: number }> {
  return items.map((i) => ({
    label: i.label.trim(),
    amount: toMinor(i.amount),
  }));
}

export async function createPayroll(
  values: PayrollFormValues,
  actorUid?: string | null
): Promise<string> {
  const staff = await getStaff(values.staffId);
  if (!staff) throw new Error("Staff not found");

  const basicSalary = toMinor(values.basicSalary);
  const allowances = toLineItemsMinor(values.allowances);
  const deductions = toLineItemsMinor(values.deductions);
  const netPay = computeNetPay(
    basicSalary,
    allowances.map((a) => a.amount),
    deductions.map((d) => d.amount)
  );

  const ref = await addDoc(
    collection(db, COLLECTION),
    withAudit(
      {
        staffId: values.staffId,
        staffUserId: staff.userId,
        staffName: staff.displayName,
        periodStart: toTimestamp(new Date(values.periodStart)),
        periodEnd: toTimestamp(new Date(values.periodEnd)),
        basicSalary,
        allowances,
        deductions,
        netPay,
        status: values.status ?? "draft",
        paidOn: values.status === "paid" ? toTimestamp(new Date()) : null,
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updatePayroll(
  id: string,
  values: Partial<PayrollFormValues>,
  actorUid?: string | null
): Promise<void> {
  const existing = await getPayroll(id);
  if (!existing) throw new Error("Payroll not found");

  const basicSalary =
    values.basicSalary !== undefined
      ? toMinor(values.basicSalary)
      : existing.basicSalary;
  const allowances =
    values.allowances !== undefined
      ? toLineItemsMinor(values.allowances)
      : existing.allowances;
  const deductions =
    values.deductions !== undefined
      ? toLineItemsMinor(values.deductions)
      : existing.deductions;

  const payload: Record<string, unknown> = {
    basicSalary,
    allowances,
    deductions,
    netPay: computeNetPay(
      basicSalary,
      allowances.map((a) => a.amount),
      deductions.map((d) => d.amount)
    ),
  };

  if (values.periodStart !== undefined) {
    payload.periodStart = toTimestamp(new Date(values.periodStart));
  }
  if (values.periodEnd !== undefined) {
    payload.periodEnd = toTimestamp(new Date(values.periodEnd));
  }
  if (values.status !== undefined) {
    payload.status = values.status;
    if (values.status === "paid" && !existing.paidOn) {
      payload.paidOn = toTimestamp(new Date());
    }
  }
  if (values.staffId !== undefined) {
    const staff = await getStaff(values.staffId);
    if (!staff) throw new Error("Staff not found");
    payload.staffId = values.staffId;
    payload.staffUserId = staff.userId;
    payload.staffName = staff.displayName;
  }

  await updateDoc(doc(db, COLLECTION, id), withAudit(payload, "update", actorUid));
}

export async function setPayrollStatus(
  id: string,
  status: PayrollStatus,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = { status };
  if (status === "paid") payload.paidOn = toTimestamp(new Date());
  await updateDoc(doc(db, COLLECTION, id), withAudit(payload, "update", actorUid));
}
