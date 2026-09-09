import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "../../../firebase";
import {
  bankAccountDocSchema,
  cancellationReasonDocSchema,
  currencyDocSchema,
  taxRateDocSchema,
  type BankAccountDoc,
  type CancellationReasonDoc,
  type CurrencyDoc,
  type TaxRateDoc,
} from "../../schemas/clinic-settings.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField } from "../../utils/firestore.utils";
import type {
  BankAccountFormValues,
  CancellationReasonFormValues,
  CurrencyFormValues,
  LookupStatus,
  TaxRateFormValues,
} from "../../types/clinic-settings.types";
import { withAudit } from "./_helpers";

const PAGE = 100;

async function listActiveOrdered<T>(
  collectionName: string,
  orderField: string,
  schema: Parameters<typeof parseDoc<T>>[0],
  status?: LookupStatus | "all"
): Promise<T[]> {
  const constraints: QueryConstraint[] = [];
  if (status && status !== "all") {
    constraints.push(where("status", "==", status));
  }
  constraints.push(orderBy(orderField), limit(PAGE));
  const snap = await getDocs(query(collection(db, collectionName), ...constraints));
  return snap.docs
    .map((d) => parseDoc(schema, d, collectionName))
    .filter((x): x is T => x !== null);
}

// --- CancellationReason ---

export async function listCancellationReasons(
  status: LookupStatus | "all" = "active"
): Promise<CancellationReasonDoc[]> {
  return listActiveOrdered(
    "CancellationReason",
    "sortOrder",
    cancellationReasonDocSchema,
    status
  );
}

export async function createCancellationReason(
  values: CancellationReasonFormValues,
  actorUid?: string | null
): Promise<string> {
  const label = values.label.trim();
  const ref = await addDoc(
    collection(db, "CancellationReason"),
    withAudit(
      {
        label,
        labelLower: toLowerSearchField(label),
        status: values.status ?? "active",
        sortOrder: values.sortOrder ?? 0,
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateCancellationReason(
  id: string,
  values: Partial<CancellationReasonFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.label !== undefined) {
    payload.label = values.label.trim();
    payload.labelLower = toLowerSearchField(values.label);
  }
  if (values.sortOrder !== undefined) payload.sortOrder = values.sortOrder;
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, "CancellationReason", id), withAudit(payload, "update", actorUid));
}

export async function setCancellationReasonStatus(
  id: string,
  status: LookupStatus,
  actorUid?: string | null
): Promise<void> {
  await updateCancellationReason(id, { status }, actorUid);
}

// --- TaxRate ---

export async function listTaxRates(
  status: LookupStatus | "all" = "active"
): Promise<TaxRateDoc[]> {
  return listActiveOrdered("TaxRate", "nameLower", taxRateDocSchema, status);
}

export async function createTaxRate(
  values: TaxRateFormValues,
  actorUid?: string | null
): Promise<string> {
  const name = values.name.trim();
  const ref = await addDoc(
    collection(db, "TaxRate"),
    withAudit(
      {
        name,
        nameLower: toLowerSearchField(name),
        ratePercent: Number(values.ratePercent) || 0,
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateTaxRate(
  id: string,
  values: Partial<TaxRateFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.name !== undefined) {
    payload.name = values.name.trim();
    payload.nameLower = toLowerSearchField(values.name);
  }
  if (values.ratePercent !== undefined) payload.ratePercent = Number(values.ratePercent) || 0;
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, "TaxRate", id), withAudit(payload, "update", actorUid));
}

export async function setTaxRateStatus(
  id: string,
  status: LookupStatus,
  actorUid?: string | null
): Promise<void> {
  await updateTaxRate(id, { status }, actorUid);
}

// --- Currency ---

export async function listCurrencies(
  status: LookupStatus | "all" = "active"
): Promise<CurrencyDoc[]> {
  return listActiveOrdered("Currency", "code", currencyDocSchema, status);
}

async function clearOtherDefaults(exceptId?: string, actorUid?: string | null) {
  const all = await listCurrencies("all");
  await Promise.all(
    all
      .filter((c) => c.isDefault && c._id !== exceptId)
      .map((c) =>
        updateDoc(
          doc(db, "Currency", c._id),
          withAudit({ isDefault: false }, "update", actorUid)
        )
      )
  );
}

export async function createCurrency(
  values: CurrencyFormValues,
  actorUid?: string | null
): Promise<string> {
  if (values.isDefault) await clearOtherDefaults(undefined, actorUid);
  const ref = await addDoc(
    collection(db, "Currency"),
    withAudit(
      {
        code: values.code.trim().toUpperCase(),
        symbol: values.symbol.trim() || "$",
        name: values.name.trim(),
        isDefault: Boolean(values.isDefault),
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateCurrency(
  id: string,
  values: Partial<CurrencyFormValues>,
  actorUid?: string | null
): Promise<void> {
  if (values.isDefault) await clearOtherDefaults(id, actorUid);
  const payload: Record<string, unknown> = {};
  if (values.code !== undefined) payload.code = values.code.trim().toUpperCase();
  if (values.symbol !== undefined) payload.symbol = values.symbol.trim();
  if (values.name !== undefined) payload.name = values.name.trim();
  if (values.isDefault !== undefined) payload.isDefault = Boolean(values.isDefault);
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, "Currency", id), withAudit(payload, "update", actorUid));
}

export async function setCurrencyStatus(
  id: string,
  status: LookupStatus,
  actorUid?: string | null
): Promise<void> {
  await updateCurrency(id, { status }, actorUid);
}

// --- BankAccount ---

export async function listBankAccounts(
  status: LookupStatus | "all" = "active"
): Promise<BankAccountDoc[]> {
  return listActiveOrdered("BankAccount", "accountName", bankAccountDocSchema, status);
}

export async function createBankAccount(
  values: BankAccountFormValues,
  actorUid?: string | null
): Promise<string> {
  const ref = await addDoc(
    collection(db, "BankAccount"),
    withAudit(
      {
        accountName: values.accountName.trim(),
        bankName: values.bankName.trim(),
        accountNumber: values.accountNumber.trim(),
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return ref.id;
}

export async function updateBankAccount(
  id: string,
  values: Partial<BankAccountFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.accountName !== undefined) payload.accountName = values.accountName.trim();
  if (values.bankName !== undefined) payload.bankName = values.bankName.trim();
  if (values.accountNumber !== undefined) payload.accountNumber = values.accountNumber.trim();
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(doc(db, "BankAccount", id), withAudit(payload, "update", actorUid));
}

export async function setBankAccountStatus(
  id: string,
  status: LookupStatus,
  actorUid?: string | null
): Promise<void> {
  await updateBankAccount(id, { status }, actorUid);
}
