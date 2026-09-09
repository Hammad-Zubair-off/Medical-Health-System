import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { auth, db } from "../../../firebase";
import type { AppUser, UserRole } from "../../types/auth.types";

export interface CreateUserProfileData {
  role: UserRole;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL?: string | null;
}

export interface UpdateUserProfileData {
  displayName?: string | null;
  phoneNumber?: string | null;
  notificationPrefs?: Record<string, boolean>;
}

/**
 * Normalize legacy role values. Defaults to "patient" (least privilege).
 */
export function normalizeRole(raw: unknown): UserRole {
  if (typeof raw === "string") {
    const lower = raw.trim().toLowerCase();
    if (lower === "admin" || lower === "super-admin" || lower === "superadmin") {
      return "admin";
    }
    if (lower === "doctor") return "doctor";
    if (lower === "patient") return "patient";
  }

  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (obj.isDoctor === true || obj.is_doctor === true) return "doctor";
  }

  return "patient";
}

/**
 * Read Users/{uid}. Document ID is the Auth uid.
 */
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  if (!uid) return null;

  const snap = await getDoc(doc(db, "Users", uid));
  if (!snap.exists()) return null;

  const data = snap.data();
  const role = normalizeRole(data.role ?? data.Role ?? data);

  return {
    uid,
    email: (data.email as string | null | undefined) ?? null,
    emailVerified: false,
    displayName:
      (data.display_name as string | null | undefined) ??
      (data.displayName as string | null | undefined) ??
      null,
    photoURL:
      (data.photo_url as string | null | undefined) ??
      (data.photoURL as string | null | undefined) ??
      null,
    role,
    doctorId: null,
    phoneNumber:
      (data.phone_number as string | null | undefined) ??
      (data.phoneNumber as string | null | undefined) ??
      null,
  };
}

export async function getUserNotificationPrefs(
  uid: string
): Promise<Record<string, boolean>> {
  if (!uid) return {};
  const snap = await getDoc(doc(db, "Users", uid));
  if (!snap.exists()) return {};
  const prefs = snap.data().notificationPrefs;
  if (prefs && typeof prefs === "object") {
    return prefs as Record<string, boolean>;
  }
  return {};
}

export async function createUserProfile(
  uid: string,
  data: CreateUserProfileData
): Promise<void> {
  await setDoc(doc(db, "Users", uid), {
    uid,
    role: data.role,
    display_name: data.displayName,
    email: data.email,
    phone_number: data.phoneNumber,
    photo_url: data.photoURL ?? null,
    created: serverTimestamp(),
  });
}

/** Update display name / phone / notification prefs. Does not change role or email. */
export async function updateUserProfile(
  uid: string,
  data: UpdateUserProfileData
): Promise<void> {
  const payload: Record<string, unknown> = {
    updated: serverTimestamp(),
    updatedBy: uid,
  };
  if (data.displayName !== undefined) {
    payload.display_name = data.displayName;
  }
  if (data.phoneNumber !== undefined) {
    payload.phone_number = data.phoneNumber;
  }
  if (data.notificationPrefs !== undefined) {
    payload.notificationPrefs = data.notificationPrefs;
  }
  await updateDoc(doc(db, "Users", uid), payload);

  if (data.displayName !== undefined && auth.currentUser?.uid === uid) {
    await updateProfile(auth.currentUser, {
      displayName: data.displayName ?? undefined,
    });
  }
}

export async function resolveDoctorId(uid: string): Promise<string | null> {
  if (!uid) return null;

  const doctorsRef = collection(db, "Doctor");
  const doctorUserRef = doc(db, "Users", uid);
  const q = query(doctorsRef, where("userid", "==", doctorUserRef));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}
