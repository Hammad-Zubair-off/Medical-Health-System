export type UserRole = "admin" | "doctor" | "patient";

export interface AppUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  /** Set only when role === "doctor": the Doctor/{id} doc id. */
  doctorId: string | null;
  phoneNumber: string | null;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
