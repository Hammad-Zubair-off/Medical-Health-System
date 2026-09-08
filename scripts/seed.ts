/**
 * One-off seed for medical-health-system-dev.
 *
 * Prerequisites:
 * 1. Create service account key in Firebase Console → Project settings → Service accounts
 * 2. Save it as scripts/serviceAccountKey.json (gitignored)
 * 3. Create Auth users in Console OR let this script create them
 *
 * Usage:
 *   npx tsx scripts/seed.ts
 *
 * Default accounts (change passwords after first login):
 *   admin@example.com / Admin123!
 *   doctor@example.com / Doctor123!
 *   patient@example.com / Patient123!
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const __dirname = dirname(fileURLToPath(import.meta.url));
const keyPath = resolve(__dirname, "serviceAccountKey.json");

if (!existsSync(keyPath)) {
  console.error(
    "Missing scripts/serviceAccountKey.json — download a service account key from Firebase Console."
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(
  readFileSync(keyPath, "utf8")
) as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

async function upsertAuthUser(
  email: string,
  password: string,
  displayName: string
) {
  try {
    const existing = await auth.getUserByEmail(email);
    return existing;
  } catch {
    return auth.createUser({ email, password, displayName, emailVerified: true });
  }
}

async function main() {
  const adminUser = await upsertAuthUser(
    "admin@example.com",
    "Admin123!",
    "Bootstrap Admin"
  );
  const doctorUser = await upsertAuthUser(
    "doctor@example.com",
    "Doctor123!",
    "Demo Doctor"
  );
  const patientUser = await upsertAuthUser(
    "patient@example.com",
    "Patient123!",
    "Demo Patient"
  );

  await db.doc(`Users/${adminUser.uid}`).set(
    {
      uid: adminUser.uid,
      role: "admin",
      display_name: "Bootstrap Admin",
      email: "admin@example.com",
      phone_number: "",
      created: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.doc(`Users/${doctorUser.uid}`).set(
    {
      uid: doctorUser.uid,
      role: "doctor",
      display_name: "Demo Doctor",
      email: "doctor@example.com",
      phone_number: "+10000000001",
      created: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  await db.doc(`Users/${patientUser.uid}`).set(
    {
      uid: patientUser.uid,
      role: "patient",
      display_name: "Demo Patient",
      email: "patient@example.com",
      phone_number: "+10000000002",
      created: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );

  const doctorRef = db.doc(`Users/${doctorUser.uid}`);
  const existingDoctors = await db
    .collection("Doctor")
    .where("userid", "==", doctorRef)
    .limit(1)
    .get();

  let doctorDocId: string;
  if (existingDoctors.empty) {
    const created = await db.collection("Doctor").add({
      userid: doctorRef,
      specialization: "General Practice",
      enabled_days: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
      created: FieldValue.serverTimestamp(),
    });
    doctorDocId = created.id;
  } else {
    doctorDocId = existingDoctors.docs[0].id;
  }

  await db.collection("Appointment").add({
    AppointmentId: "SEED-001",
    doctorUserId: doctorRef,
    doctorId: doctorDocId,
    UserPatientID: db.doc(`Users/${patientUser.uid}`),
    patientsName: "Demo Patient",
    patientsNumber: "+10000000002",
    patientsEmail: "patient@example.com",
    appointmentDate: FieldValue.serverTimestamp(),
    appointmentTime: FieldValue.serverTimestamp(),
    appointmentType: "physical",
    isVideoCall: false,
    status: "pending",
    created: FieldValue.serverTimestamp(),
  });

  console.log("Seed complete.");
  console.log({
    adminUid: adminUser.uid,
    doctorUid: doctorUser.uid,
    doctorDocId,
    patientUid: patientUser.uid,
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
