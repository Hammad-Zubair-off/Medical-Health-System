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
import {
  expenseCategoryDocSchema,
  expenseDocSchema,
  type ExpenseCategoryDoc,
  type ExpenseDoc,
} from "../../schemas/expense.schema";
import { parseDoc } from "../../schemas/_shared";
import { toLowerSearchField, toTimestamp } from "../../utils/firestore.utils";
import { toMinor } from "../../utils/money.utils";
import { withAudit } from "./_helpers";
import type {
  ExpenseCategoryFormValues,
  ExpenseCategoryStatus,
  ExpenseFormValues,
  ExpenseStatus,
  ListExpenseCategoriesParams,
  ListExpenseCategoriesResult,
  ListExpensesParams,
  ListExpensesResult,
} from "../../types/expense.types";

const EXPENSE_COLLECTION = "Expense";
const CATEGORY_COLLECTION = "ExpenseCategory";
const DEFAULT_PAGE_SIZE = 20;

export async function listExpenses(
  params: ListExpensesParams = {}
): Promise<ListExpensesResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, EXPENSE_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.categoryId) {
    constraints.push(where("categoryId", "==", params.categoryId));
  }
  if (params.status) {
    constraints.push(where("status", "==", params.status));
  }
  constraints.push(orderBy("spentOn", "desc"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, EXPENSE_COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }

  constraints.push(limit(pageSize));
  const snap = await getDocs(query(ref, ...constraints));
  const expenses = snap.docs
    .map((d) => parseDoc(expenseDocSchema, d, "Expense"))
    .filter((p): p is ExpenseDoc => p !== null);

  return {
    expenses: expenses as unknown as ListExpensesResult["expenses"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function getExpense(id: string): Promise<ExpenseDoc | null> {
  if (!id) return null;
  const snap = await getDoc(doc(db, EXPENSE_COLLECTION, id));
  return parseDoc(expenseDocSchema, snap, "Expense");
}

export async function createExpense(
  values: ExpenseFormValues,
  actorUid?: string | null
): Promise<string> {
  let categoryName: string | null = null;
  if (values.categoryId) {
    const cat = await getDoc(doc(db, CATEGORY_COLLECTION, values.categoryId));
    if (cat.exists()) {
      categoryName = (cat.data().name as string) ?? null;
    }
  }

  const expenseId = `EXP-${Date.now().toString(36).toUpperCase()}`;
  const docRef = await addDoc(
    collection(db, EXPENSE_COLLECTION),
    withAudit(
      {
        expenseId,
        categoryId: values.categoryId,
        categoryName,
        title: values.title.trim(),
        amount: toMinor(values.amount),
        spentOn: toTimestamp(new Date(values.spentOn)) ?? toTimestamp(new Date()),
        paymentMethod: values.paymentMethod,
        vendor: values.vendor || null,
        receiptUrl: values.receiptUrl || null,
        notes: values.notes || null,
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return docRef.id;
}

export async function updateExpense(
  id: string,
  values: Partial<ExpenseFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};

  if (values.title !== undefined) payload.title = values.title.trim();
  if (values.amount !== undefined) payload.amount = toMinor(values.amount);
  if (values.spentOn !== undefined) {
    payload.spentOn = toTimestamp(new Date(values.spentOn));
  }
  if (values.paymentMethod !== undefined) payload.paymentMethod = values.paymentMethod;
  if (values.vendor !== undefined) payload.vendor = values.vendor || null;
  if (values.receiptUrl !== undefined) payload.receiptUrl = values.receiptUrl || null;
  if (values.notes !== undefined) payload.notes = values.notes || null;
  if (values.status !== undefined) payload.status = values.status;

  if (values.categoryId !== undefined) {
    payload.categoryId = values.categoryId;
    const cat = await getDoc(doc(db, CATEGORY_COLLECTION, values.categoryId));
    payload.categoryName = cat.exists() ? (cat.data().name as string) ?? null : null;
  }

  await updateDoc(doc(db, EXPENSE_COLLECTION, id), withAudit(payload, "update", actorUid));
}

export async function setExpenseStatus(
  id: string,
  status: ExpenseStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, EXPENSE_COLLECTION, id),
    withAudit({ status }, "update", actorUid)
  );
}

export async function listExpenseCategories(
  params: ListExpenseCategoriesParams = {}
): Promise<ListExpenseCategoriesResult> {
  const pageSize = params.pageSize ?? DEFAULT_PAGE_SIZE;
  const ref = collection(db, CATEGORY_COLLECTION);
  const constraints: QueryConstraint[] = [];

  if (params.status) {
    constraints.push(where("status", "==", params.status));
  }
  constraints.push(orderBy("nameLower"));

  if (params.cursor) {
    const cursorSnap = await getDoc(doc(db, CATEGORY_COLLECTION, params.cursor));
    if (cursorSnap.exists()) constraints.push(startAfter(cursorSnap));
  }

  constraints.push(limit(pageSize));
  const snap = await getDocs(query(ref, ...constraints));
  const categories = snap.docs
    .map((d) => parseDoc(expenseCategoryDocSchema, d, "ExpenseCategory"))
    .filter((p): p is ExpenseCategoryDoc => p !== null);

  return {
    categories: categories as unknown as ListExpenseCategoriesResult["categories"],
    nextCursor:
      snap.docs.length === pageSize ? snap.docs[snap.docs.length - 1].id : null,
  };
}

export async function createExpenseCategory(
  values: ExpenseCategoryFormValues,
  actorUid?: string | null
): Promise<string> {
  const name = values.name.trim();
  const docRef = await addDoc(
    collection(db, CATEGORY_COLLECTION),
    withAudit(
      {
        name,
        nameLower: toLowerSearchField(name),
        description: values.description || null,
        status: values.status ?? "active",
      },
      "create",
      actorUid
    )
  );
  return docRef.id;
}

export async function setExpenseCategoryStatus(
  id: string,
  status: ExpenseCategoryStatus,
  actorUid?: string | null
): Promise<void> {
  await updateDoc(
    doc(db, CATEGORY_COLLECTION, id),
    withAudit({ status }, "update", actorUid)
  );
}

export async function updateExpenseCategory(
  id: string,
  values: Partial<ExpenseCategoryFormValues>,
  actorUid?: string | null
): Promise<void> {
  const payload: Record<string, unknown> = {};
  if (values.name !== undefined) {
    payload.name = values.name.trim();
    payload.nameLower = toLowerSearchField(values.name);
  }
  if (values.description !== undefined) {
    payload.description = values.description || null;
  }
  if (values.status !== undefined) payload.status = values.status;
  await updateDoc(
    doc(db, CATEGORY_COLLECTION, id),
    withAudit(payload, "update", actorUid)
  );
}
