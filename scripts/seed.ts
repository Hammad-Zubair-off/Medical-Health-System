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
 *   npm run seed
 *
 * Accounts (change passwords after first login):
 *   Admin:   admin@example.com  / Admin123!
 *            admin2@example.com / Admin123!
 *            admin3@example.com / Admin123!
 *   Doctor:  doctor@example.com  / Doctor123!
 *            doctor2@example.com / Doctor123!
 *            doctor3@example.com / Doctor123!
 *   Patient: patient@example.com  / Patient123!
 *            patient2@example.com / Patient123!
 *            patient3@example.com / Patient123!
 */
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue, type DocumentReference } from "firebase-admin/firestore";

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

type SeedRole = "admin" | "doctor" | "patient";

interface SeedAccount {
  email: string;
  password: string;
  displayName: string;
  role: SeedRole;
  phoneNumber: string;
  specialization?: string;
}

const SEED_ACCOUNTS: SeedAccount[] = [
  {
    email: "admin@example.com",
    password: "Admin123!",
    displayName: "Bootstrap Admin",
    role: "admin",
    phoneNumber: "",
  },
  {
    email: "admin2@example.com",
    password: "Admin123!",
    displayName: "Admin Two",
    role: "admin",
    phoneNumber: "",
  },
  {
    email: "admin3@example.com",
    password: "Admin123!",
    displayName: "Admin Three",
    role: "admin",
    phoneNumber: "",
  },
  {
    email: "doctor@example.com",
    password: "Doctor123!",
    displayName: "Demo Doctor",
    role: "doctor",
    phoneNumber: "+10000000001",
    specialization: "General Practice",
  },
  {
    email: "doctor2@example.com",
    password: "Doctor123!",
    displayName: "Demo Doctor Two",
    role: "doctor",
    phoneNumber: "+10000000011",
    specialization: "Cardiology",
  },
  {
    email: "doctor3@example.com",
    password: "Doctor123!",
    displayName: "Demo Doctor Three",
    role: "doctor",
    phoneNumber: "+10000000012",
    specialization: "Pediatrics",
  },
  {
    email: "doctor4@example.com",
    password: "Doctor123!",
    displayName: "Demo Doctor Four",
    role: "doctor",
    phoneNumber: "+10000000013",
    specialization: "Dermatology",
  },
  {
    email: "doctor5@example.com",
    password: "Doctor123!",
    displayName: "Demo Doctor Five",
    role: "doctor",
    phoneNumber: "+10000000014",
    specialization: "Orthopedics",
  },
  {
    email: "patient@example.com",
    password: "Patient123!",
    displayName: "Demo Patient",
    role: "patient",
    phoneNumber: "+10000000002",
  },
  {
    email: "patient2@example.com",
    password: "Patient123!",
    displayName: "Demo Patient Two",
    role: "patient",
    phoneNumber: "+10000000022",
  },
  {
    email: "patient3@example.com",
    password: "Patient123!",
    displayName: "Demo Patient Three",
    role: "patient",
    phoneNumber: "+10000000023",
  },
];

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

async function ensureSpecialization(name: string, description: string): Promise<string> {
  const nameLower = name.trim().toLowerCase();
  const existing = await db
    .collection("Specialization")
    .where("nameLower", "==", nameLower)
    .limit(1)
    .get();
  if (!existing.empty) {
    return existing.docs[0].id;
  }
  const created = await db.collection("Specialization").add({
    name,
    nameLower,
    description,
    icon: null,
    status: "active",
    created: FieldValue.serverTimestamp(),
    createdBy: "seed",
  });
  return created.id;
}

async function ensureDoctorDoc(
  userRef: DocumentReference,
  account: SeedAccount,
  specializationId: string
): Promise<string> {
  const existingDoctors = await db
    .collection("Doctor")
    .where("userid", "==", userRef)
    .limit(1)
    .get();

  const payload = {
    userid: userRef,
    specialization: account.specialization ?? "General Practice",
    specializationId,
    displayName: account.displayName,
    displayNameLower: account.displayName.trim().toLowerCase(),
    email: account.email,
    phoneNumber: account.phoneNumber,
    status: "active",
    qualifications: ["MD"],
    experienceYears: 8,
    consultationFee: 150,
    bio: `${account.displayName} — seeded demo doctor.`,
    enabled_days: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  };

  if (!existingDoctors.empty) {
    await existingDoctors.docs[0].ref.set(payload, { merge: true });
    return existingDoctors.docs[0].id;
  }

  const created = await db.collection("Doctor").add({
    ...payload,
    created: FieldValue.serverTimestamp(),
    createdBy: "seed",
  });
  return created.id;
}

async function ensurePatient(data: {
  patientId: string;
  userId: string | null;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  gender: "male" | "female" | "other";
  bloodGroup: string;
  status: "active" | "inactive";
  primaryDoctorId: string | null;
  lastVisit: Date | null;
  city: string;
  state: string;
}) {
  const existing = data.userId
    ? await db.collection("Patient").where("userId", "==", data.userId).limit(1).get()
    : await db.collection("Patient").where("patientId", "==", data.patientId).limit(1).get();

  const payload = {
    patientId: data.patientId,
    userId: data.userId,
    displayName: data.displayName,
    displayNameLower: data.displayName.trim().toLowerCase(),
    email: data.email,
    phoneNumber: data.phoneNumber,
    photoUrl: null,
    dateOfBirth: new Date("1994-04-12"),
    gender: data.gender,
    bloodGroup: data.bloodGroup,
    address: {
      line1: "100 Demo Street",
      line2: null,
      city: data.city,
      state: data.state,
      country: "USA",
      postalCode: "10001",
    },
    allergies: [],
    status: data.status,
    primaryDoctorId: data.primaryDoctorId,
    lastVisit: data.lastVisit,
  };

  if (!existing.empty) {
    await existing.docs[0].ref.set(payload, { merge: true });
    return existing.docs[0].id;
  }

  const created = await db.collection("Patient").add({
    ...payload,
    created: FieldValue.serverTimestamp(),
    createdBy: "seed",
  });
  return created.id;
}

async function main() {
  const specIds: Record<string, string> = {};
  const specSeed = [
    ["General Practice", "Primary care"],
    ["Cardiology", "Heart and vascular"],
    ["Pediatrics", "Child health"],
    ["Dermatology", "Skin"],
    ["Orthopedics", "Bones and joints"],
    ["Neurology", "Nervous system"],
    ["Ophthalmology", "Eye care"],
    ["ENT", "Ear, nose, and throat"],
  ] as const;
  for (const [name, description] of specSeed) {
    specIds[name] = await ensureSpecialization(name, description);
  }

  const created: Array<{
    role: SeedRole;
    email: string;
    uid: string;
    doctorDocId?: string;
  }> = [];

  const doctorDocIds: string[] = [];
  const patientUids: Array<{ uid: string; account: SeedAccount }> = [];

  for (const account of SEED_ACCOUNTS) {
    const user = await upsertAuthUser(
      account.email,
      account.password,
      account.displayName
    );

    await db.doc(`Users/${user.uid}`).set(
      {
        uid: user.uid,
        role: account.role,
        display_name: account.displayName,
        email: account.email,
        phone_number: account.phoneNumber,
        created: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    const entry: {
      role: SeedRole;
      email: string;
      uid: string;
      doctorDocId?: string;
    } = {
      role: account.role,
      email: account.email,
      uid: user.uid,
    };

    if (account.role === "doctor") {
      const userRef = db.doc(`Users/${user.uid}`);
      const specName = account.specialization ?? "General Practice";
      const doctorDocId = await ensureDoctorDoc(
        userRef,
        account,
        specIds[specName] ?? specIds["General Practice"]
      );
      entry.doctorDocId = doctorDocId;
      doctorDocIds.push(doctorDocId);
    }

    if (account.role === "patient") {
      patientUids.push({ uid: user.uid, account });
    }

    created.push(entry);
  }

  const primaryDoctor = doctorDocIds[0] ?? null;
  const walkIns = [
    {
      patientId: "PT-WALK-01",
      displayName: "Walk-in Avery Cole",
      email: "avery.walkin@example.com",
      phoneNumber: "+10000001001",
      gender: "female" as const,
      bloodGroup: "A+",
      status: "active" as const,
      city: "Austin",
      state: "Texas",
      lastVisit: new Date("2026-08-01"),
    },
    {
      patientId: "PT-WALK-02",
      displayName: "Walk-in Blake Dunn",
      email: "blake.walkin@example.com",
      phoneNumber: "+10000001002",
      gender: "male" as const,
      bloodGroup: "O+",
      status: "active" as const,
      city: "Miami",
      state: "Florida",
      lastVisit: new Date("2026-07-15"),
    },
    {
      patientId: "PT-WALK-03",
      displayName: "Walk-in Casey Frost",
      email: null,
      phoneNumber: "+10000001003",
      gender: "other" as const,
      bloodGroup: "B+",
      status: "inactive" as const,
      city: "Seattle",
      state: "Washington",
      lastVisit: null,
    },
    {
      patientId: "PT-WALK-04",
      displayName: "Walk-in Drew Hale",
      email: "drew.walkin@example.com",
      phoneNumber: "+10000001004",
      gender: "female" as const,
      bloodGroup: "AB+",
      status: "active" as const,
      city: "Chicago",
      state: "Illinois",
      lastVisit: new Date("2026-06-20"),
    },
    {
      patientId: "PT-WALK-05",
      displayName: "Walk-in Ellis Grant",
      email: "ellis.walkin@example.com",
      phoneNumber: "+10000001005",
      gender: "male" as const,
      bloodGroup: "O-",
      status: "active" as const,
      city: "Phoenix",
      state: "Arizona",
      lastVisit: new Date("2026-05-02"),
    },
  ];

  const patientDocIds: Array<{
    id: string;
    userId: string | null;
    displayName: string;
    email: string | null;
    phoneNumber: string | null;
  }> = [];

  for (const [index, row] of patientUids.entries()) {
    const id = await ensurePatient({
      patientId: `PT-USER-0${index + 1}`,
      userId: row.uid,
      displayName: row.account.displayName,
      email: row.account.email,
      phoneNumber: row.account.phoneNumber,
      gender: index === 1 ? "female" : "male",
      bloodGroup: "O+",
      status: "active",
      primaryDoctorId: primaryDoctor,
      lastVisit: index === 0 ? new Date() : null,
      city: "Los Angeles",
      state: "California",
    });
    patientDocIds.push({
      id,
      userId: row.uid,
      displayName: row.account.displayName,
      email: row.account.email,
      phoneNumber: row.account.phoneNumber,
    });
  }

  for (const walkIn of walkIns) {
    const id = await ensurePatient({
      ...walkIn,
      userId: null,
      primaryDoctorId: primaryDoctor,
    });
    patientDocIds.push({
      id,
      userId: null,
      displayName: walkIn.displayName,
      email: walkIn.email,
      phoneNumber: walkIn.phoneNumber,
    });
  }

  for (let i = 6; i <= 18; i++) {
    const id = await ensurePatient({
      patientId: `PT-WALK-${String(i).padStart(2, "0")}`,
      userId: null,
      displayName: `Walk-in Patient ${i}`,
      email: `walkin${i}@example.com`,
      phoneNumber: `+100000010${String(i).padStart(2, "0")}`,
      gender: i % 2 === 0 ? "female" : "male",
      bloodGroup: "O+",
      status: "active",
      primaryDoctorId: primaryDoctor,
      lastVisit: i % 3 === 0 ? new Date("2026-04-01") : null,
      city: "Boston",
      state: "Massachusetts",
    });
    patientDocIds.push({
      id,
      userId: null,
      displayName: `Walk-in Patient ${i}`,
      email: `walkin${i}@example.com`,
      phoneNumber: `+100000010${String(i).padStart(2, "0")}`,
    });
  }

  const doctorsForAppt = created.filter((c) => c.role === "doctor" && c.doctorDocId);
  const statuses = [
    "pending",
    "confirmed",
    "checked-in",
    "checked-out",
    "completed",
    "cancelled",
    "rescheduled",
  ] as const;

  async function ensureSeedAppointment(seedId: string, data: Record<string, unknown>) {
    const existing = await db
      .collection("Appointment")
      .where("AppointmentId", "==", seedId)
      .limit(1)
      .get();
    if (!existing.empty) {
      await existing.docs[0].ref.set(data, { merge: true });
      return existing.docs[0].id;
    }
    return (
      await db.collection("Appointment").add({
        ...data,
        created: FieldValue.serverTimestamp(),
        createdBy: "seed",
      })
    ).id;
  }

  let seededAppointments = 0;
  if (doctorsForAppt.length > 0 && patientDocIds.length > 0) {
    for (let i = 0; i < 24; i++) {
      const doctor = doctorsForAppt[i % doctorsForAppt.length];
      const patient = patientDocIds[i % patientDocIds.length];
      const dayOffset = i < 12 ? -(12 - i) : i - 11;
      const when = new Date();
      when.setDate(when.getDate() + dayOffset);
      when.setHours(9 + (i % 8), (i * 7) % 60, 0, 0);

      const seedId = `SEED-${String(i + 1).padStart(3, "0")}`;
      await ensureSeedAppointment(seedId, {
        AppointmentId: seedId,
        patientId: patient.id,
        UserPatientID: patient.userId ? db.doc(`Users/${patient.userId}`) : null,
        doctorUserId: db.doc(`Users/${doctor.uid}`),
        doctorId: doctor.doctorDocId,
        patientsName: patient.displayName,
        patientsNumber: patient.phoneNumber ?? "",
        patientsEmail: patient.email ?? "",
        DoctorsName: doctor.email,
        appointmentDate: when,
        appointmentTime: when,
        appointmentType: i % 3 === 0 ? "video" : "physical",
        isVideoCall: i % 3 === 0,
        status: statuses[i % statuses.length],
        Complain: i % 2 === 0 ? "Follow-up visit" : "General consultation",
        description: "Seeded appointment",
        price: 50 + (i % 5) * 25,
      });
      seededAppointments += 1;
    }
  }

  console.log("Seed complete.");
  console.log({
    specializations: Object.keys(specIds).length,
    accounts: created.length,
    doctors: doctorDocIds.length,
    linkedPatients: patientUids.length,
    walkIns: walkIns.length + 13,
    appointments: seededAppointments,
  });
  console.log(created);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
