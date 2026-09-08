import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { env } from "./core/config/env";

const app = initializeApp(env.firebase);

export const db = getFirestore(app);
export const auth = getAuth(app);
export { app };
