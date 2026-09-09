import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  where,
  Timestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import { parseDoc } from "../../schemas/_shared";
import { appointmentDocSchema, type AppointmentDoc } from "../../schemas/appointment.schema";
import { patientDocSchema, type PatientDoc } from "../../schemas/patient.schema";
import { paymentDocSchema, type PaymentDoc } from "../../schemas/payment.schema";
import { expenseDocSchema, type ExpenseDoc } from "../../schemas/expense.schema";
import { toDate } from "../../utils/firestore.utils";
import { formatMoney, addMinor, type MinorUnits } from "../../utils/money.utils";
import {
  MAX_REPORT_DOCS,
  ReportRangeError,
  resolveReportRange,
  percentageChange,
  pickGranularity,
  groupByPeriod,
  type DateRange,
} from "../../utils/report.utils";
import { formatDate, formatGenderAge, formatAddress } from "../../utils/display.utils";

export interface ReportFetchMeta {
  truncated: boolean;
  docCount: number;
  range: DateRange;
  message?: string;
}

async function fetchDateBounded<T>(opts: {
  collectionName: string;
  dateField: string;
  range: DateRange;
  parse: (snap: QueryDocumentSnapshot<DocumentData>) => T | null;
  extraConstraints?: QueryConstraint[];
}): Promise<{ rows: T[]; truncated: boolean }> {
  const ref = collection(db, opts.collectionName);
  const fromTs = Timestamp.fromDate(opts.range.from);
  const toTs = Timestamp.fromDate(opts.range.to);
  const pageSize = 500;
  const rows: T[] = [];
  let cursor: QueryDocumentSnapshot<DocumentData> | null = null;
  let truncated = false;

  while (rows.length < MAX_REPORT_DOCS) {
    const batchLimit = Math.min(pageSize, MAX_REPORT_DOCS - rows.length);
    const constraints: QueryConstraint[] = [
      ...(opts.extraConstraints ?? []),
      where(opts.dateField, ">=", fromTs),
      where(opts.dateField, "<=", toTs),
      orderBy(opts.dateField, "desc"),
    ];
    if (cursor) constraints.push(startAfter(cursor));
    constraints.push(limit(batchLimit));

    const snap = await getDocs(query(ref, ...constraints));
    if (snap.empty) break;

    for (const d of snap.docs) {
      const parsed = opts.parse(d);
      if (parsed) rows.push(parsed);
    }
    cursor = snap.docs[snap.docs.length - 1];
    if (snap.docs.length < batchLimit) break;
    if (rows.length >= MAX_REPORT_DOCS) {
      truncated = true;
      break;
    }
  }

  return { rows, truncated };
}

function statusLabel(status: string): string {
  return status
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export interface AppointmentReportRow {
  id: string;
  Patient: string;
  DateTime: string;
  InvoiceID: string;
  Practioner: string;
  Location: string;
  Status: string;
}

export interface AppointmentReportResult extends ReportFetchMeta {
  rows: AppointmentReportRow[];
  byStatus: Record<string, number>;
  series: { key: string; count: number }[];
}

export async function getAppointmentReport(
  range?: Partial<DateRange> | null
): Promise<AppointmentReportResult> {
  const resolved = resolveReportRange(range);
  const { rows: appointments, truncated } = await fetchDateBounded<AppointmentDoc>({
    collectionName: "Appointment",
    dateField: "appointmentDate",
    range: resolved,
    parse: (snap) => parseDoc(appointmentDocSchema, snap, "Appointment"),
  });

  const byStatus: Record<string, number> = {};
  for (const apt of appointments) {
    const s = apt.status || "pending";
    byStatus[s] = (byStatus[s] || 0) + 1;
  }

  const granularity = pickGranularity(resolved);
  const grouped = groupByPeriod(appointments, (a) => toDate(a.appointmentDate), granularity);
  const series: { key: string; count: number }[] = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({ key, count: items.length }));

  const rows: AppointmentReportRow[] = appointments.map((apt) => {
    const date = toDate(apt.appointmentDate);
    const time = toDate(apt.appointmentTime);
    const dateStr = date ? formatDate(date) : "—";
    const timeStr = time
      ? time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      : "";
    return {
      id: apt._id,
      Patient: apt.patientsName || "—",
      DateTime: timeStr ? `${dateStr} - ${timeStr}` : dateStr,
      InvoiceID: apt.AppointmentId ? `#${apt.AppointmentId}` : "—",
      Practioner: apt.DoctorsName || "—",
      Location: "—",
      Status: statusLabel(apt.status || "pending"),
    };
  });

  return {
    rows,
    byStatus,
    series,
    truncated,
    docCount: appointments.length,
    range: resolved,
    message: truncated
      ? `Results capped at ${MAX_REPORT_DOCS} appointments. Narrow your date range.`
      : undefined,
  };
}

export interface PatientReportRow {
  id: string;
  Patient: string;
  AgeGender: string;
  ContactInfo: string;
  Email: string;
  Practioner: string;
  Location: string;
  LastVisit: string;
  Status: string;
}

export interface PatientReportResult extends ReportFetchMeta {
  rows: PatientReportRow[];
  newCount: number;
  activeCount: number;
}

export async function getPatientReport(
  range?: Partial<DateRange> | null
): Promise<PatientReportResult> {
  const resolved = resolveReportRange(range);
  const { rows: patients, truncated } = await fetchDateBounded<PatientDoc>({
    collectionName: "Patient",
    dateField: "created",
    range: resolved,
    parse: (snap) => parseDoc(patientDocSchema, snap, "Patient"),
  });

  const rows: PatientReportRow[] = patients.map((p) => ({
    id: p._id,
    Patient: p.displayName || "—",
    AgeGender: formatGenderAge(p.gender, p.dateOfBirth),
    ContactInfo: p.phoneNumber || "—",
    Email: p.email || "",
    Practioner: "—",
    Location: formatAddress(p.address),
    LastVisit: formatDate(p.lastVisit),
    Status: p.status === "active" ? "Available" : "Inactive",
  }));

  return {
    rows,
    newCount: patients.length,
    activeCount: patients.filter((p) => p.status === "active").length,
    truncated,
    docCount: patients.length,
    range: resolved,
    message: truncated
      ? `Results capped at ${MAX_REPORT_DOCS} patients. Narrow your date range.`
      : undefined,
  };
}

export interface IncomeReportRow {
  id: string;
  Income: string;
  Amount: string;
  Date: string;
  ReceivedFrom: string;
  PaymentMethod: string;
  Status: string;
  amountMinor: MinorUnits;
}

export interface IncomeReportResult extends ReportFetchMeta {
  rows: IncomeReportRow[];
  totalMinor: MinorUnits;
  series: { key: string; totalMinor: MinorUnits }[];
}

export async function getIncomeReport(
  range?: Partial<DateRange> | null
): Promise<IncomeReportResult> {
  const resolved = resolveReportRange(range);
  const { rows: payments, truncated } = await fetchDateBounded<PaymentDoc>({
    collectionName: "Payment",
    dateField: "paidOn",
    range: resolved,
    parse: (snap) => parseDoc(paymentDocSchema, snap, "Payment"),
    extraConstraints: [where("status", "==", "completed")],
  });

  const totalMinor = addMinor(...payments.map((p) => Math.round(p.amount || 0)));
  const granularity = pickGranularity(resolved);
  const grouped = groupByPeriod(payments, (p) => toDate(p.paidOn), granularity);
  const series: { key: string; totalMinor: MinorUnits }[] = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      key,
      totalMinor: addMinor(...items.map((p) => Math.round(p.amount || 0))),
    }));

  const rows: IncomeReportRow[] = payments.map((p) => ({
    id: p._id,
    Income: p.invoiceNumber ? `Payment ${p.invoiceNumber}` : p.paymentId || "Payment",
    Amount: formatMoney(Math.round(p.amount || 0)),
    Date: formatDate(p.paidOn),
    ReceivedFrom: p.patientName || "—",
    PaymentMethod: statusLabel(p.method || "cash"),
    Status: p.status === "completed" ? "Received" : statusLabel(p.status),
    amountMinor: Math.round(p.amount || 0),
  }));

  return {
    rows,
    totalMinor,
    series,
    truncated,
    docCount: payments.length,
    range: resolved,
    message: truncated
      ? `Results capped at ${MAX_REPORT_DOCS} payments. Narrow your date range.`
      : undefined,
  };
}

export interface ExpenseReportRow {
  id: string;
  Expense: string;
  Category: string;
  Amount: string;
  Date: string;
  Vendor: string;
  PaymentMethod: string;
  Status: string;
  amountMinor: MinorUnits;
}

export interface ExpenseReportResult extends ReportFetchMeta {
  rows: ExpenseReportRow[];
  totalMinor: MinorUnits;
  series: { key: string; totalMinor: MinorUnits }[];
}

export async function getExpenseReport(
  range?: Partial<DateRange> | null
): Promise<ExpenseReportResult> {
  const resolved = resolveReportRange(range);
  const { rows: expenses, truncated } = await fetchDateBounded<ExpenseDoc>({
    collectionName: "Expense",
    dateField: "spentOn",
    range: resolved,
    parse: (snap) => parseDoc(expenseDocSchema, snap, "Expense"),
    extraConstraints: [where("status", "==", "active")],
  });

  const totalMinor = addMinor(...expenses.map((e) => Math.round(e.amount || 0)));
  const granularity = pickGranularity(resolved);
  const grouped = groupByPeriod(expenses, (e) => toDate(e.spentOn), granularity);
  const series: { key: string; totalMinor: MinorUnits }[] = Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, items]) => ({
      key,
      totalMinor: addMinor(...items.map((e) => Math.round(e.amount || 0))),
    }));

  const rows: ExpenseReportRow[] = expenses.map((e) => ({
    id: e._id,
    Expense: e.title || e.expenseId || "Expense",
    Category: e.categoryName || "—",
    Amount: formatMoney(Math.round(e.amount || 0)),
    Date: formatDate(e.spentOn),
    Vendor: e.vendor || "—",
    PaymentMethod: statusLabel(e.paymentMethod || "cash"),
    Status: statusLabel(e.status || "active"),
    amountMinor: Math.round(e.amount || 0),
  }));

  return {
    rows,
    totalMinor,
    series,
    truncated,
    docCount: expenses.length,
    range: resolved,
    message: truncated
      ? `Results capped at ${MAX_REPORT_DOCS} expenses. Narrow your date range.`
      : undefined,
  };
}

export interface ProfitAndLossResult extends ReportFetchMeta {
  incomeMinor: MinorUnits;
  expenseMinor: MinorUnits;
  profitMinor: MinorUnits;
  incomeFormatted: string;
  expenseFormatted: string;
  profitFormatted: string;
  incomeChangePct: number;
  expenseChangePct: number;
  profitChangePct: number;
}

function previousRange(range: DateRange): DateRange {
  const spanMs = range.to.getTime() - range.from.getTime();
  const to = new Date(range.from.getTime() - 1);
  const from = new Date(to.getTime() - spanMs);
  return resolveReportRange({ from, to });
}

export async function getProfitAndLoss(
  range?: Partial<DateRange> | null
): Promise<ProfitAndLossResult> {
  const resolved = resolveReportRange(range);
  const prev = previousRange(resolved);

  const [income, expense, prevIncome, prevExpense] = await Promise.all([
    getIncomeReport(resolved),
    getExpenseReport(resolved),
    getIncomeReport(prev),
    getExpenseReport(prev),
  ]);

  if (income.truncated || expense.truncated) {
    throw new ReportRangeError(
      "Too many transactions in this range. Narrow your dates and try again."
    );
  }

  const incomeMinor = income.totalMinor;
  const expenseMinor = expense.totalMinor;
  const profitMinor = incomeMinor - expenseMinor;
  const prevProfit = prevIncome.totalMinor - prevExpense.totalMinor;

  return {
    incomeMinor,
    expenseMinor,
    profitMinor,
    incomeFormatted: formatMoney(incomeMinor),
    expenseFormatted: formatMoney(expenseMinor),
    profitFormatted: formatMoney(profitMinor),
    incomeChangePct: percentageChange(incomeMinor, prevIncome.totalMinor),
    expenseChangePct: percentageChange(expenseMinor, prevExpense.totalMinor),
    profitChangePct: percentageChange(profitMinor, prevProfit),
    truncated: false,
    docCount: income.docCount + expense.docCount,
    range: resolved,
  };
}

export { ReportRangeError, resolveReportRange, defaultDateRange } from "../../utils/report.utils";
