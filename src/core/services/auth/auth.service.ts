import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  confirmPasswordReset,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  deleteUser,
  type User,
} from "firebase/auth";
import { auth } from "../../../firebase";
import { createUserProfile } from "../firestore/users.service";
import { createLinkedPatient } from "../firestore/patient.service";
import { mapAuthError } from "./auth-errors";

function throwMapped(error: unknown): never {
  throw new Error(mapAuthError(error));
}

export async function signIn(email: string, password: string): Promise<User> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return cred.user;
  } catch (error) {
    throwMapped(error);
  }
}

/**
 * Patient self-registration. Rolls back Auth user if Firestore profile write fails.
 */
export async function signUpPatient(
  email: string,
  password: string,
  displayName: string,
  phoneNumber: string
): Promise<User> {
  let user: User | null = null;
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    user = cred.user;

    if (displayName) {
      await updateProfile(user, { displayName });
    }

    await createUserProfile(user.uid, {
      role: "patient",
      displayName,
      email,
      phoneNumber,
      photoURL: user.photoURL,
    });

    // Every patient needs a Patient/{id} doc so doctors/admin can read their
    // clinical summary — doctors can't read another user's Users doc directly.
    await createLinkedPatient(user.uid, { displayName, email, phoneNumber });

    await sendEmailVerification(user);
    return user;
  } catch (error) {
    if (user) {
      try {
        await deleteUser(user);
      } catch (rollbackError) {
        console.error("Failed to roll back Auth user after profile write failure:", rollbackError);
      }
    }
    throwMapped(error);
  }
}

export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    throwMapped(error);
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    // Enumeration prevention: callers should always show the same success message.
    // Still map unexpected failures (network, etc.) for the rare case we want to surface them.
    const code =
      error && typeof error === "object" && "code" in error
        ? String((error as { code: string }).code)
        : "";
    if (
      code === "auth/user-not-found" ||
      code === "auth/invalid-email" ||
      code === "auth/invalid-credential"
    ) {
      return;
    }
    throwMapped(error);
  }
}

export async function confirmPasswordResetWithCode(
  oobCode: string,
  newPassword: string
): Promise<void> {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
  } catch (error) {
    throwMapped(error);
  }
}

export async function resendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("You must be signed in to resend verification.");
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throwMapped(error);
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user?.email) throw new Error("You must be signed in to change your password.");
  try {
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
  } catch (error) {
    throwMapped(error);
  }
}
