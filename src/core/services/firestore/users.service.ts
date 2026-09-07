import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../firebase";
import type { AppUser, UserRole } from "../../types/auth.types";

export interface CreateUserProfileData {
  role: UserRole;
  displayName: string | null;
  email: string | null;
  phoneNumber: string | null;
  photoURL?: string | null;
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
    emailVerified: false, // filled from Auth user in AuthContext
    displayName:
      (data.display_name as string | null | undefined) ??
      (data.displayName as string | null | undefined) ??
      null,
    photoURL:
      (data.photo_url as string | null | undefined) ??
      (data.photoURL as string | null | undefined) ??
      null,
    role,
    doctorId: null, // resolved separately for doctors
    phoneNumber:
      (data.phone_number as string | null | undefined) ??
      (data.phoneNumber as string | null | undefined) ??
      null,
  };
}

/**
 * Create Users/{uid}. Always keys by Auth uid as document ID,
 * and also stores a `uid` field for backward-compatible where queries.
 */
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

/**
 * Resolve Doctor/{id} where userid == Users/{uid} reference.
 * Matches getDoctorDataByUserId query shape.
 */
export async function resolveDoctorId(uid: string): Promise<string | null> {
  if (!uid) return null;

  const doctorsRef = collection(db, "Doctor");
  const doctorUserRef = doc(db, "Users", uid);
  const q = query(doctorsRef, where("userid", "==", doctorUserRef));
  const snapshot = await getDocs(q);

  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}
