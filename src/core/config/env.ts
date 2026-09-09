function requireEnv(_name: string, value: unknown): string {
  if (typeof value !== "string" || value.trim() === "") {
    return "";
  }
  return value.trim();
}

const apiKey = requireEnv("VITE_FIREBASE_API_KEY", import.meta.env.VITE_FIREBASE_API_KEY);
const authDomain = requireEnv(
  "VITE_FIREBASE_AUTH_DOMAIN",
  import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
);
const projectId = requireEnv(
  "VITE_FIREBASE_PROJECT_ID",
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);
const storageBucket = requireEnv(
  "VITE_FIREBASE_STORAGE_BUCKET",
  import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
);
const messagingSenderId = requireEnv(
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
);
const appId = requireEnv("VITE_FIREBASE_APP_ID", import.meta.env.VITE_FIREBASE_APP_ID);

const cloudinaryCloudName = requireEnv(
  "VITE_CLOUDINARY_CLOUD_NAME",
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
);
const cloudinaryUploadPreset = requireEnv(
  "VITE_CLOUDINARY_UPLOAD_PRESET",
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
);

const missing = [
  !apiKey && "VITE_FIREBASE_API_KEY",
  !authDomain && "VITE_FIREBASE_AUTH_DOMAIN",
  !projectId && "VITE_FIREBASE_PROJECT_ID",
  !storageBucket && "VITE_FIREBASE_STORAGE_BUCKET",
  !messagingSenderId && "VITE_FIREBASE_MESSAGING_SENDER_ID",
  !appId && "VITE_FIREBASE_APP_ID",
  !cloudinaryCloudName && "VITE_CLOUDINARY_CLOUD_NAME",
  !cloudinaryUploadPreset && "VITE_CLOUDINARY_UPLOAD_PRESET",
].filter(Boolean) as string[];

if (missing.length > 0) {
  throw new Error(
    `Missing required env vars. Copy .env.example to .env.local and fill in:\n  - ${missing.join("\n  - ")}`
  );
}

export const env = Object.freeze({
  firebase: Object.freeze({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  }),
  cloudinary: Object.freeze({
    cloudName: cloudinaryCloudName,
    uploadPreset: cloudinaryUploadPreset,
  }),
});
