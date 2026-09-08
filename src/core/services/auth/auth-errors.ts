import type { FirebaseError } from "firebase/app";

const GENERIC_LOGIN = "Invalid email or password.";

const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": GENERIC_LOGIN,
  "auth/user-not-found": GENERIC_LOGIN,
  "auth/wrong-password": GENERIC_LOGIN,
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters with a letter and a number.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/requires-recent-login": "Please sign in again before changing your password.",
  "auth/expired-action-code": "This link has expired. Request a new one.",
  "auth/invalid-action-code": "This link is invalid or has already been used. Request a new one.",
  "auth/user-disabled": "This account has been disabled. Contact an administrator.",
};

export function mapAuthError(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as FirebaseError).code)
      : "";

  if (code && MESSAGES[code]) return MESSAGES[code];
  return "Something went wrong. Please try again.";
}
