import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../../firebase";
import {
  clinicSettingsDocSchema,
  DEFAULT_CLINIC_SETTINGS,
  type ClinicSettingsDoc,
} from "../../schemas/clinic-settings.schema";
import { parseDoc } from "../../schemas/_shared";
import type { ClinicSettingsUpdate } from "../../types/clinic-settings.types";
import { withAudit } from "./_helpers";

const COLLECTION = "ClinicSettings";
export const CLINIC_SETTINGS_DOC_ID = "main";

function deepMerge<T extends Record<string, unknown>>(
  base: T,
  patch: Partial<T> | undefined
): T {
  if (!patch) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof base[key as keyof T] === "object" &&
      base[key as keyof T] !== null
    ) {
      out[key] = deepMerge(
        base[key as keyof T] as Record<string, unknown>,
        value as Record<string, unknown>
      );
    } else if (value !== undefined) {
      out[key] = value;
    }
  }
  return out as T;
}

/** Returns defaults when the doc is missing so settings UIs always load. */
export async function getClinicSettings(): Promise<ClinicSettingsDoc> {
  const snap = await getDoc(doc(db, COLLECTION, CLINIC_SETTINGS_DOC_ID));
  if (!snap.exists()) {
    return {
      _id: CLINIC_SETTINGS_DOC_ID,
      ...DEFAULT_CLINIC_SETTINGS,
      created: null,
      createdBy: null,
      updated: null,
      updatedBy: null,
    } as ClinicSettingsDoc;
  }
  const parsed = parseDoc(clinicSettingsDocSchema, snap, "ClinicSettings");
  if (parsed) return parsed;
  return {
    _id: CLINIC_SETTINGS_DOC_ID,
    ...DEFAULT_CLINIC_SETTINGS,
    created: null,
    createdBy: null,
    updated: null,
    updatedBy: null,
  } as ClinicSettingsDoc;
}

export async function updateClinicSettings(
  patch: ClinicSettingsUpdate,
  actorUid?: string | null
): Promise<ClinicSettingsDoc> {
  const current = await getClinicSettings();
  const merged = deepMerge(
    {
      organization: current.organization,
      workingHours: current.workingHours,
      appointmentPrefs: current.appointmentPrefs,
      invoice: current.invoice,
      paymentMethods: current.paymentMethods,
      gdpr: current.gdpr,
      maintenance: current.maintenance,
      preferences: current.preferences,
      localization: current.localization,
    },
    patch as Record<string, unknown>
  );

  const ref = doc(db, COLLECTION, CLINIC_SETTINGS_DOC_ID);
  const exists = (await getDoc(ref)).exists();
  await setDoc(
    ref,
    withAudit(merged, exists ? "update" : "create", actorUid),
    { merge: true }
  );
  return getClinicSettings();
}
