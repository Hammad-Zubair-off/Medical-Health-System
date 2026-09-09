import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { env } from "./core/config/env";

const app = initializeApp(env.firebase);

export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };

const SECONDARY_APP_NAME = "SecondaryAuth";

/**
 * Separate Auth instance used only to create other users' login accounts
 * without replacing the signed-in admin session on the primary `auth`.
 */
export function getSecondaryAuth(): Auth {
  const existing = getApps().find((a) => a.name === SECONDARY_APP_NAME);
  const secondary: FirebaseApp = existing
    ? getApp(SECONDARY_APP_NAME)
    : initializeApp(env.firebase, SECONDARY_APP_NAME);
  return getAuth(secondary);
}
