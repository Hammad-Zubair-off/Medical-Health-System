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
 * Accounts (change passwords after first login) — see docs/DEMO_ACCOUNTS.md
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
  /** Doctor extras */
  qualifications?: string[];
  experienceYears?: number;
  consultationFee?: number;
  bio?: string;
  /** Patient extras */
  gender?: "male" | "female" | "other";
  bloodGroup?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  address?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    country?: string;
    postalCode: string;
  };
  allergies?: string[];
}

const SEED_ACCOUNTS: SeedAccount[] = [
  // ——— Admins (original) ———
  {
    email: "admin@example.com",
    password: "Admin123!",
    displayName: "Bootstrap Admin",
    role: "admin",
    phoneNumber: "+12125550100",
  },
  {
    email: "admin2@example.com",
    password: "Admin123!",
    displayName: "Admin Two",
    role: "admin",
    phoneNumber: "+12125550101",
  },
  {
    email: "admin3@example.com",
    password: "Admin123!",
    displayName: "Admin Three",
    role: "admin",
    phoneNumber: "+12125550102",
  },
  // ——— Admins (new realistic) ———
  {
    email: "sarah.mitchell@trustcare.example.com",
    password: "Admin123!",
    displayName: "Sarah Mitchell",
    role: "admin",
    phoneNumber: "+13105552841",
  },
  {
    email: "james.rivera@trustcare.example.com",
    password: "Admin123!",
    displayName: "James Rivera",
    role: "admin",
    phoneNumber: "+17185553402",
  },
  {
    email: "priya.sharma@trustcare.example.com",
    password: "Admin123!",
    displayName: "Priya Sharma",
    role: "admin",
    phoneNumber: "+14085551967",
  },
  {
    email: "marcus.chen@trustcare.example.com",
    password: "Admin123!",
    displayName: "Marcus Chen",
    role: "admin",
    phoneNumber: "+16175554813",
  },
  // ——— Doctors (original) ———
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
  // ——— Doctors (new realistic) ———
  {
    email: "elena.vargas@trustcare.example.com",
    password: "Doctor123!",
    displayName: "Dr. Elena Vargas",
    role: "doctor",
    phoneNumber: "+13105558217",
    specialization: "Neurology",
    qualifications: ["MD", "PhD", "Board Certified Neurology"],
    experienceYears: 14,
    consultationFee: 220,
    bio: "Dr. Elena Vargas specializes in headache disorders and stroke recovery. She trained at UCLA and speaks English and Spanish.",
  },
  {
    email: "omar.hassan@trustcare.example.com",
    password: "Doctor123!",
    displayName: "Dr. Omar Hassan",
    role: "doctor",
    phoneNumber: "+17025556394",
    specialization: "Ophthalmology",
    qualifications: ["MD", "FACS"],
    experienceYears: 11,
    consultationFee: 185,
    bio: "Dr. Omar Hassan focuses on cataract surgery and diabetic eye care. Clinic days Mon–Thu.",
  },
  {
    email: "naomi.brooks@trustcare.example.com",
    password: "Doctor123!",
    displayName: "Dr. Naomi Brooks",
    role: "doctor",
    phoneNumber: "+14155557720",
    specialization: "ENT",
    qualifications: ["MD", "Otolaryngology"],
    experienceYears: 9,
    consultationFee: 175,
    bio: "Dr. Naomi Brooks treats sinus disease, hearing loss, and pediatric ENT. Former Kaiser attending.",
  },
  {
    email: "liam.oconnor@trustcare.example.com",
    password: "Doctor123!",
    displayName: "Dr. Liam O'Connor",
    role: "doctor",
    phoneNumber: "+16175550148",
    specialization: "General Practice",
    qualifications: ["MD", "Family Medicine"],
    experienceYears: 16,
    consultationFee: 140,
    bio: "Dr. Liam O'Connor provides full-spectrum primary care for adults and teens, with a focus on preventive medicine.",
  },
  // ——— Patients (original) ———
  {
    email: "patient@example.com",
    password: "Patient123!",
    displayName: "Demo Patient",
    role: "patient",
    phoneNumber: "+10000000002",
    gender: "male",
    bloodGroup: "O+",
  },
  {
    email: "patient2@example.com",
    password: "Patient123!",
    displayName: "Demo Patient Two",
    role: "patient",
    phoneNumber: "+10000000022",
    gender: "female",
    bloodGroup: "A+",
  },
  {
    email: "patient3@example.com",
    password: "Patient123!",
    displayName: "Demo Patient Three",
    role: "patient",
    phoneNumber: "+10000000023",
    gender: "male",
    bloodGroup: "B+",
  },
  // ——— Patients (new realistic) ———
  {
    email: "maya.patel@email.example.com",
    password: "Patient123!",
    displayName: "Maya Patel",
    role: "patient",
    phoneNumber: "+14085552931",
    gender: "female",
    bloodGroup: "B+",
    dateOfBirth: "1988-03-22",
    address: {
      line1: "1847 Willow Creek Drive",
      line2: "Apt 4B",
      city: "San Jose",
      state: "California",
      country: "USA",
      postalCode: "95112",
    },
    allergies: ["Penicillin"],
  },
  {
    email: "daniel.wright@email.example.com",
    password: "Patient123!",
    displayName: "Daniel Wright",
    role: "patient",
    phoneNumber: "+13035554186",
    gender: "male",
    bloodGroup: "A-",
    dateOfBirth: "1975-11-08",
    address: {
      line1: "902 Larimer Street",
      line2: null,
      city: "Denver",
      state: "Colorado",
      country: "USA",
      postalCode: "80204",
    },
    allergies: ["Peanuts", "Shellfish"],
  },
  {
    email: "sofia.alvarez@email.example.com",
    password: "Patient123!",
    displayName: "Sofia Alvarez",
    role: "patient",
    phoneNumber: "+12145556802",
    gender: "female",
    bloodGroup: "O-",
    dateOfBirth: "1999-07-14",
    address: {
      line1: "3310 Oak Lawn Avenue",
      line2: "Suite 12",
      city: "Dallas",
      state: "Texas",
      country: "USA",
      postalCode: "75219",
    },
    allergies: [],
  },
  {
    email: "henry.nguyen@email.example.com",
    password: "Patient123!",
    displayName: "Henry Nguyen",
    role: "patient",
    phoneNumber: "+15035557764",
    gender: "male",
    bloodGroup: "AB+",
    dateOfBirth: "1968-01-30",
    address: {
      line1: "215 NW Davis Street",
      line2: null,
      city: "Portland",
      state: "Oregon",
      country: "USA",
      postalCode: "97209",
    },
    allergies: ["Latex"],
  },
];

async function upsertAuthUser(
  email: string,
  password: string,
  displayName: string,
  phoneNumber?: string
) {
  try {
    const existing = await auth.getUserByEmail(email);
    const update: { displayName: string; phoneNumber?: string } = { displayName };
    // Only set phone when non-empty and not already used elsewhere
    if (phoneNumber) {
      try {
        await auth.updateUser(existing.uid, {
          displayName,
          phoneNumber,
          emailVerified: true,
        });
      } catch {
        await auth.updateUser(existing.uid, { displayName, emailVerified: true });
      }
      return auth.getUser(existing.uid);
    }
    await auth.updateUser(existing.uid, update);
    return existing;
  } catch {
    try {
      return await auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
        ...(phoneNumber ? { phoneNumber } : {}),
      });
    } catch {
      // Phone conflict — create without phone
      return auth.createUser({
        email,
        password,
        displayName,
        emailVerified: true,
      });
    }
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
    qualifications: account.qualifications ?? ["MD"],
    experienceYears: account.experienceYears ?? 8,
    consultationFee: account.consultationFee ?? 150,
    bio:
      account.bio ??
      `${account.displayName} — seeded demo doctor.`,
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
  dateOfBirth?: string;
  address?: {
    line1: string;
    line2?: string | null;
    city: string;
    state: string;
    country?: string;
    postalCode: string;
  };
  allergies?: string[];
}) {
  const existing = data.userId
    ? await db.collection("Patient").where("userId", "==", data.userId).limit(1).get()
    : await db.collection("Patient").where("patientId", "==", data.patientId).limit(1).get();

  const addr = data.address;
  const payload = {
    patientId: data.patientId,
    userId: data.userId,
    displayName: data.displayName,
    displayNameLower: data.displayName.trim().toLowerCase(),
    email: data.email,
    phoneNumber: data.phoneNumber,
    photoUrl: null,
    dateOfBirth: new Date(data.dateOfBirth ?? "1994-04-12"),
    gender: data.gender,
    bloodGroup: data.bloodGroup,
    address: {
      line1: addr?.line1 ?? "100 Demo Street",
      line2: addr?.line2 ?? null,
      city: addr?.city ?? data.city,
      state: addr?.state ?? data.state,
      country: addr?.country ?? "USA",
      postalCode: addr?.postalCode ?? "10001",
    },
    allergies: data.allergies ?? [],
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
      account.displayName,
      account.phoneNumber || undefined
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
    const a = row.account;
    const id = await ensurePatient({
      patientId: `PT-USER-0${index + 1}`,
      userId: row.uid,
      displayName: a.displayName,
      email: a.email,
      phoneNumber: a.phoneNumber,
      gender: a.gender ?? (index === 1 ? "female" : "male"),
      bloodGroup: a.bloodGroup ?? "O+",
      status: "active",
      primaryDoctorId: primaryDoctor,
      lastVisit: index === 0 ? new Date() : null,
      city: a.address?.city ?? "Los Angeles",
      state: a.address?.state ?? "California",
      dateOfBirth: a.dateOfBirth,
      address: a.address,
      allergies: a.allergies,
    });
    patientDocIds.push({
      id,
      userId: row.uid,
      displayName: a.displayName,
      email: a.email,
      phoneNumber: a.phoneNumber,
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
  const appointmentDocIds: string[] = [];
  if (doctorsForAppt.length > 0 && patientDocIds.length > 0) {
    for (let i = 0; i < 24; i++) {
      const doctor = doctorsForAppt[i % doctorsForAppt.length];
      const patient = patientDocIds[i % patientDocIds.length];
      const dayOffset = i < 12 ? -(12 - i) : i - 11;
      const when = new Date();
      when.setDate(when.getDate() + dayOffset);
      when.setHours(9 + (i % 8), (i * 7) % 60, 0, 0);

      const seedId = `SEED-${String(i + 1).padStart(3, "0")}`;
      const apptId = await ensureSeedAppointment(seedId, {
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
      appointmentDocIds.push(apptId);
      seededAppointments += 1;
    }
  }

  const medicineSets = [
    [
      {
        name: "Amoxicillin",
        dosage: "500mg",
        frequency: "1-0-1",
        duration: "7 days",
        instructions: "After meal",
      },
      {
        name: "Ibuprofen",
        dosage: "200mg",
        frequency: "1-1-1",
        duration: "5 days",
        instructions: "With food",
      },
    ],
    [
      {
        name: "Atorvastatin",
        dosage: "10mg",
        frequency: "0-0-1",
        duration: "30 days",
        instructions: "At bedtime",
      },
    ],
    [
      {
        name: "Metformin",
        dosage: "500mg",
        frequency: "1-0-1",
        duration: "30 days",
        instructions: "With meals",
      },
      {
        name: "Vitamin D3",
        dosage: "1000 IU",
        frequency: "1-0-0",
        duration: "60 days",
        instructions: null,
      },
    ],
    [
      {
        name: "Omeprazole",
        dosage: "20mg",
        frequency: "1-0-0",
        duration: "14 days",
        instructions: "Before breakfast",
      },
    ],
    [
      {
        name: "Cetirizine",
        dosage: "10mg",
        frequency: "0-0-1",
        duration: "10 days",
        instructions: "Evening",
      },
      {
        name: "Saline nasal spray",
        dosage: "2 sprays",
        frequency: "1-1-1",
        duration: "7 days",
        instructions: "Each nostril",
      },
    ],
  ];

  async function ensureSeedPrescription(
    seedId: string,
    data: Record<string, unknown>
  ): Promise<string> {
    const existing = await db
      .collection("Prescription")
      .where("prescriptionId", "==", seedId)
      .limit(1)
      .get();
    if (!existing.empty) {
      await existing.docs[0].ref.set(data, { merge: true });
      return existing.docs[0].id;
    }
    return (
      await db.collection("Prescription").add({
        ...data,
        created: FieldValue.serverTimestamp(),
        createdBy: "seed",
      })
    ).id;
  }

  let seededPrescriptions = 0;
  if (doctorsForAppt.length > 0 && patientDocIds.length > 0) {
    const rxStatuses = ["active", "completed", "cancelled"] as const;
    for (let i = 0; i < 10; i++) {
      const doctor = doctorsForAppt[i % doctorsForAppt.length];
      const patient = patientDocIds[i % patientDocIds.length];
      const when = new Date();
      when.setDate(when.getDate() - i * 3);
      when.setHours(10, 0, 0, 0);
      const followUp = new Date(when);
      followUp.setDate(followUp.getDate() + 14);
      const seedId = `PRE-SEED-${String(i + 1).padStart(3, "0")}`;
      await ensureSeedPrescription(seedId, {
        prescriptionId: seedId,
        appointmentId: appointmentDocIds[i] ?? null,
        doctorId: doctor.doctorDocId,
        doctorUserId: doctor.uid,
        doctorName: doctor.email,
        patientId: patient.id,
        patientUserId: patient.userId,
        patientName: patient.displayName,
        patientNameLower: patient.displayName.trim().toLowerCase(),
        prescribedOn: when,
        diagnosis: i % 2 === 0 ? "Upper respiratory infection" : "Hypertension follow-up",
        notes: i % 3 === 0 ? "Rest and hydrate. Return if symptoms worsen." : null,
        followUpDate: i % 2 === 0 ? followUp : null,
        medicines: medicineSets[i % medicineSets.length],
        status: rxStatuses[i % rxStatuses.length],
        updated: FieldValue.serverTimestamp(),
        updatedBy: "seed",
      });
      seededPrescriptions += 1;
    }
  }

  // --- Finance seed ---
  async function ensureByField(
    collectionName: string,
    field: string,
    value: string,
    data: Record<string, unknown>
  ) {
    const existing = await db
      .collection(collectionName)
      .where(field, "==", value)
      .limit(1)
      .get();
    if (!existing.empty) {
      await existing.docs[0].ref.set(data, { merge: true });
      return existing.docs[0].id;
    }
    const createdDoc = await db.collection(collectionName).add({
      ...data,
      created: FieldValue.serverTimestamp(),
      createdBy: "seed",
    });
    return createdDoc.id;
  }

  const categoryDefs = [
    { name: "Medical Supplies", description: "Consumables and clinic supplies" },
    { name: "Utilities", description: "Electricity, water, internet" },
    { name: "Payroll Support", description: "Non-salary staff costs" },
  ];
  const categoryIds: string[] = [];
  for (const cat of categoryDefs) {
    const id = await ensureByField("ExpenseCategory", "nameLower", cat.name.toLowerCase(), {
      name: cat.name,
      nameLower: cat.name.toLowerCase(),
      description: cat.description,
      status: "active",
    });
    categoryIds.push(id);
  }

  const counterRef = db.collection("Counter").doc("invoice");
  const counterSnap = await counterRef.get();
  if (!counterSnap.exists) {
    await counterRef.set({ next: 1 });
  }

  const financeDoctor = doctorsForAppt[0];
  const financeDoctorUid = financeDoctor?.uid ?? null;
  const financeDoctorDocId = financeDoctor?.doctorDocId ?? null;
  const financeDoctorName = financeDoctor
    ? created.find((c) => c.uid === financeDoctor.uid)?.email ?? "Demo Doctor"
    : null;

  const invoiceSeeds = [
    {
      seedKey: "SEED-INV-001",
      patient: patientDocIds[0],
      total: 80000,
      amountPaid: 80000,
      status: "paid" as const,
      lineDesc: "General consultation",
    },
    {
      seedKey: "SEED-INV-002",
      patient: patientDocIds[1] ?? patientDocIds[0],
      total: 150000,
      amountPaid: 50000,
      status: "partially-paid" as const,
      lineDesc: "Follow-up + labs",
    },
    {
      seedKey: "SEED-INV-003",
      patient: patientDocIds[2] ?? patientDocIds[0],
      total: 120000,
      amountPaid: 0,
      status: "sent" as const,
      lineDesc: "Specialist consultation",
    },
  ];

  const invoiceDocIds: string[] = [];
  let invoiceNumber = counterSnap.exists
    ? Number(counterSnap.data()?.next ?? 1)
    : 1;

  for (const row of invoiceSeeds) {
    if (!row.patient) continue;
    const existing = await db
      .collection("Invoice")
      .where("notes", "==", row.seedKey)
      .limit(1)
      .get();

    const issuedOn = new Date();
    issuedOn.setDate(issuedOn.getDate() - 10);
    const dueDate = new Date(issuedOn);
    dueDate.setDate(dueDate.getDate() + 14);

    const number = `INV-${String(invoiceNumber).padStart(4, "0")}`;
    const payload = {
      invoiceNumber: number,
      appointmentId: null,
      patientId: row.patient.id,
      patientUserId: row.patient.userId,
      patientName: row.patient.displayName,
      patientNameLower: row.patient.displayName.toLowerCase(),
      doctorId: financeDoctorDocId,
      doctorUserId: financeDoctorUid,
      doctorName: financeDoctorName,
      issuedOn,
      dueDate,
      lineItems: [
        {
          description: row.lineDesc,
          quantity: 1,
          unitPrice: row.total,
          amount: row.total,
        },
      ],
      subtotal: row.total,
      taxRate: 0,
      taxAmount: 0,
      discount: 0,
      total: row.total,
      amountPaid: row.amountPaid,
      balance: Math.max(0, row.total - row.amountPaid),
      status: row.status,
      notes: row.seedKey,
    };

    let id: string;
    if (!existing.empty) {
      await existing.docs[0].ref.set(payload, { merge: true });
      id = existing.docs[0].id;
    } else {
      id = (
        await db.collection("Invoice").add({
          ...payload,
          created: FieldValue.serverTimestamp(),
          createdBy: "seed",
        })
      ).id;
      invoiceNumber += 1;
    }
    invoiceDocIds.push(id);
  }

  await counterRef.set({ next: invoiceNumber }, { merge: true });

  const paymentSeeds = [
    {
      seedKey: "SEED-PAY-001",
      invoiceIndex: 0,
      amount: 80000,
      method: "card" as const,
    },
    {
      seedKey: "SEED-PAY-002",
      invoiceIndex: 1,
      amount: 50000,
      method: "cash" as const,
    },
  ];

  for (const pay of paymentSeeds) {
    const invId = invoiceDocIds[pay.invoiceIndex];
    const inv = invoiceSeeds[pay.invoiceIndex];
    if (!invId || !inv?.patient) continue;
    await ensureByField("Payment", "paymentId", pay.seedKey, {
      paymentId: pay.seedKey,
      invoiceId: invId,
      invoiceNumber: `INV-${String(pay.invoiceIndex + 1).padStart(4, "0")}`,
      patientId: inv.patient.id,
      patientUserId: inv.patient.userId,
      patientName: inv.patient.displayName,
      amount: pay.amount,
      method: pay.method,
      paidOn: new Date(),
      reference: "seed",
      notes: null,
      status: "completed",
    });
  }

  const expenseSeeds = [
    {
      seedKey: "SEED-EXP-001",
      categoryIndex: 0,
      title: "Gloves and masks",
      amount: 12500,
    },
    {
      seedKey: "SEED-EXP-002",
      categoryIndex: 1,
      title: "Monthly electricity",
      amount: 34000,
    },
    {
      seedKey: "SEED-EXP-003",
      categoryIndex: 2,
      title: "Temp nurse stipend",
      amount: 20000,
    },
  ];

  for (const exp of expenseSeeds) {
    await ensureByField("Expense", "expenseId", exp.seedKey, {
      expenseId: exp.seedKey,
      categoryId: categoryIds[exp.categoryIndex],
      categoryName: categoryDefs[exp.categoryIndex].name,
      title: exp.title,
      amount: exp.amount,
      spentOn: new Date(),
      paymentMethod: "bank-transfer",
      vendor: "Seed Vendor",
      receiptUrl: null,
      notes: null,
      status: "active",
    });
  }

  // --- HRM seed ---
  const deptDefs = [
    { name: "Clinical", head: null as string | null },
    { name: "Nursing", head: null },
    { name: "Administration", head: null },
    { name: "Billing", head: null },
  ];
  const deptIds: Record<string, string> = {};
  for (const d of deptDefs) {
    const id = await ensureByField("Department", "nameLower", d.name.toLowerCase(), {
      name: d.name,
      nameLower: d.name.toLowerCase(),
      headStaffId: null,
      status: "active",
    });
    deptIds[d.name] = id;
  }

  const desigDefs = [
    { name: "Physician", department: "Clinical" },
    { name: "Staff Nurse", department: "Nursing" },
    { name: "Receptionist", department: "Administration" },
    { name: "Billing Executive", department: "Billing" },
    { name: "HR Executive", department: "Administration" },
  ];
  const desigIds: Record<string, string> = {};
  for (const d of desigDefs) {
    const id = await ensureByField("Designation", "nameLower", d.name.toLowerCase(), {
      name: d.name,
      nameLower: d.name.toLowerCase(),
      departmentId: deptIds[d.department] ?? null,
      status: "active",
    });
    desigIds[d.name] = id;
  }

  const leaveTypeDefs = [
    { name: "Sick Leave", days: 12, isPaid: true },
    { name: "Casual Leave", days: 8, isPaid: true },
    { name: "Emergency", days: 3, isPaid: false },
    { name: "Vacation", days: 15, isPaid: true },
  ];
  const leaveTypeIds: Record<string, string> = {};
  for (const t of leaveTypeDefs) {
    const id = await ensureByField("LeaveType", "nameLower", t.name.toLowerCase(), {
      name: t.name,
      nameLower: t.name.toLowerCase(),
      daysAllowedPerYear: t.days,
      isPaid: t.isPaid,
      status: "active",
    });
    leaveTypeIds[t.name] = id;
  }

  const doctorAccounts = created.filter((c) => c.role === "doctor");
  const adminAccount = created.find((c) => c.role === "admin");

  const staffSeeds = [
    {
      seedKey: "SEED-STF-DOC1",
      displayName: doctorAccounts[0]?.email?.split("@")[0]
        ? created.find((c) => c.uid === doctorAccounts[0]?.uid)?.email
          ? "Demo Doctor"
          : "Demo Doctor"
        : "Demo Doctor",
      userId: doctorAccounts[0]?.uid ?? null,
      email: "doctor@example.com",
      phone: "+10000000001",
      department: "Clinical",
      designation: "Physician",
    },
    {
      seedKey: "SEED-STF-DOC2",
      displayName: "Demo Doctor Two",
      userId: doctorAccounts[1]?.uid ?? null,
      email: "doctor2@example.com",
      phone: "+10000000011",
      department: "Clinical",
      designation: "Physician",
    },
    {
      seedKey: "SEED-STF-ADMIN",
      displayName: "Bootstrap Admin",
      userId: adminAccount?.uid ?? null,
      email: "admin@example.com",
      phone: "+10000000000",
      department: "Administration",
      designation: "HR Executive",
    },
    {
      seedKey: "SEED-STF-NURSE",
      displayName: "Clinic Nurse",
      userId: null,
      email: "nurse@example.com",
      phone: "+10000000020",
      department: "Nursing",
      designation: "Staff Nurse",
    },
    {
      seedKey: "SEED-STF-RECEPTION",
      displayName: "Front Desk",
      userId: null,
      email: "reception@example.com",
      phone: "+10000000021",
      department: "Administration",
      designation: "Receptionist",
    },
  ];

  const staffDocIds: { id: string; userId: string | null; name: string; seedKey: string }[] =
    [];
  for (const s of staffSeeds) {
    const id = await ensureByField("Staff", "staffId", s.seedKey, {
      staffId: s.seedKey,
      userId: s.userId,
      displayName: s.displayName,
      displayNameLower: s.displayName.toLowerCase(),
      email: s.email,
      phoneNumber: s.phone,
      photoUrl: null,
      departmentId: deptIds[s.department] ?? null,
      departmentName: s.department,
      designationId: desigIds[s.designation] ?? null,
      designationName: s.designation,
      joiningDate: new Date("2024-01-15"),
      employmentType: "full-time",
      status: "active",
    });
    staffDocIds.push({
      id,
      userId: s.userId,
      name: s.displayName,
      seedKey: s.seedKey,
    });
  }

  const nearToday = new Date();
  nearToday.setDate(nearToday.getDate() + 2);
  nearToday.setHours(0, 0, 0, 0);

  const holidaySeeds = [
    {
      seedKey: "SEED-HOL-NY",
      name: "New Year",
      date: new Date(nearToday.getFullYear(), 0, 1),
      isRecurring: true,
    },
    {
      seedKey: "SEED-HOL-NEAR",
      name: "Clinic Closed (seed)",
      date: nearToday,
      isRecurring: false,
    },
    {
      seedKey: "SEED-HOL-IND",
      name: "Independence Day",
      date: new Date(nearToday.getFullYear(), 7, 14),
      isRecurring: true,
    },
  ];
  for (const h of holidaySeeds) {
    await ensureByField("Holiday", "name", h.name, {
      name: h.name,
      date: h.date,
      isRecurring: h.isRecurring,
      status: "active",
    });
  }

  const leaveSeeds = [
    {
      seedKey: "SEED-LV-001",
      staffIndex: 0,
      type: "Sick Leave",
      status: "approved" as const,
      daysAgo: 14,
      days: 1,
    },
    {
      seedKey: "SEED-LV-002",
      staffIndex: 1,
      type: "Casual Leave",
      status: "pending" as const,
      daysAgo: 2,
      days: 2,
    },
    {
      seedKey: "SEED-LV-003",
      staffIndex: 3,
      type: "Vacation",
      status: "rejected" as const,
      daysAgo: 30,
      days: 3,
    },
    // Pending leave for demo doctor (doctor@example.com) — used by E2E approve flow
    {
      seedKey: "SEED-LV-DOC1-PENDING",
      staffIndex: 0,
      type: "Casual Leave",
      status: "pending" as const,
      daysAgo: 1,
      days: 1,
    },
    // Always-pending leave for admin approve QA (reset to pending on every seed)
    {
      seedKey: "SEED-LV-QA-ALWAYS-PENDING",
      staffIndex: 1,
      type: "Sick Leave",
      status: "pending" as const,
      daysAgo: 0,
      days: 1,
    },
  ];
  for (const lv of leaveSeeds) {
    const st = staffDocIds[lv.staffIndex] ?? staffDocIds[0];
    if (!st) continue;
    const from = new Date();
    from.setDate(from.getDate() - lv.daysAgo);
    from.setHours(0, 0, 0, 0);
    const to = new Date(from);
    to.setDate(to.getDate() + Math.max(0, lv.days - 1));
    await ensureByField("Leave", "reason", lv.seedKey, {
      staffId: st.id,
      staffUserId: st.userId,
      staffName: st.name,
      leaveTypeId: leaveTypeIds[lv.type],
      leaveTypeName: lv.type,
      from,
      to,
      days: lv.days,
      reason: lv.seedKey,
      status: lv.status,
      reviewedBy: lv.status === "pending" ? null : adminAccount?.uid ?? null,
      reviewedOn: lv.status === "pending" ? null : new Date(),
    });
  }

  const periodStart = new Date(nearToday.getFullYear(), nearToday.getMonth(), 1);
  const periodEnd = new Date(nearToday.getFullYear(), nearToday.getMonth() + 1, 0);
  for (let i = 0; i < Math.min(3, staffDocIds.length); i++) {
    const st = staffDocIds[i];
    const basic = [12000000, 15000000, 10000000][i] ?? 10000000;
    const allowances = [{ label: "Transport", amount: 500000 }];
    const deductions = [{ label: "Tax", amount: 1000000 }];
    const netPay = basic + 500000 - 1000000;
    const paySeedKey = `${st.seedKey}-PAY`;
    await ensureByField("Payroll", "seedKey", paySeedKey, {
      seedKey: paySeedKey,
      staffId: st.id,
      staffUserId: st.userId,
      staffName: st.name,
      periodStart,
      periodEnd,
      basicSalary: basic,
      allowances,
      deductions,
      netPay,
      status: i === 0 ? "paid" : i === 1 ? "approved" : "draft",
      paidOn: i === 0 ? new Date() : null,
    });
  }

  for (let i = 0; i < Math.min(4, staffDocIds.length); i++) {
    const st = staffDocIds[i];
    const day = new Date();
    day.setDate(day.getDate() - i);
    day.setHours(0, 0, 0, 0);
    const checkIn = new Date(day);
    checkIn.setHours(9, 0, 0, 0);
    const checkOut = new Date(day);
    checkOut.setHours(17, 30, 0, 0);
    const attSeedKey = `${st.seedKey}-ATT-${i}`;
    await ensureByField("Attendance", "seedKey", attSeedKey, {
      seedKey: attSeedKey,
      staffId: st.id,
      staffName: st.name,
      date: day,
      checkIn: i === 2 ? null : checkIn,
      checkOut: i === 2 ? null : checkOut,
      status: i === 2 ? "absent" : "present",
      workedMinutes: i === 2 ? 0 : 510,
    });
  }

  // --- Clinic settings + finance lookups ---
  await db.collection("ClinicSettings").doc("main").set(
    {
      organization: {
        name: "Preclinic",
        email: "admin@example.com",
        phone: "+10000000000",
        website: "https://example.com",
        addressLine1: "100 Clinic Road",
        addressLine2: "",
        city: "Los Angeles",
        state: "California",
        country: "USA",
        postalCode: "90001",
        logoUrl: null,
      },
      workingHours: {
        monday: { enabled: true, start: "09:00", end: "17:00" },
        tuesday: { enabled: true, start: "09:00", end: "17:00" },
        wednesday: { enabled: true, start: "09:00", end: "17:00" },
        thursday: { enabled: true, start: "09:00", end: "17:00" },
        friday: { enabled: true, start: "09:00", end: "17:00" },
        saturday: { enabled: false, start: "09:00", end: "13:00" },
        sunday: { enabled: false, start: "09:00", end: "13:00" },
      },
      appointmentPrefs: {
        autoNotifyUpcoming: true,
        weekendRemindersOnFriday: false,
        autoCancelOnNoReply: false,
        sendReminderOnBooking: true,
      },
      invoice: {
        prefix: "INV",
        dueDaysDefault: 14,
        terms: "Payment due within 14 days.",
        footerNote: "Thank you for choosing Preclinic.",
      },
      paymentMethods: {
        cash: true,
        card: true,
        bankTransfer: true,
        insurance: true,
        other: true,
      },
      gdpr: {
        enabled: false,
        bannerText:
          "We use cookies to improve your experience. By continuing you agree to our use of cookies.",
        position: "bottom",
      },
      maintenance: {
        enabled: false,
        message:
          "The clinic portal is temporarily under maintenance. Please try again later.",
      },
      preferences: {
        hideApplicationsMenu: true,
        showLayoutsMenu: true,
      },
      localization: {
        timezone: "America/Los_Angeles",
        dateFormat: "DD-MM-YYYY",
        timeFormat: "12h",
      },
      updated: FieldValue.serverTimestamp(),
      updatedBy: "seed",
    },
    { merge: true }
  );

  const cancelReasons = [
    { label: "Patient request", sortOrder: 1 },
    { label: "Doctor unavailable", sortOrder: 2 },
    { label: "Emergency", sortOrder: 3 },
  ];
  for (const r of cancelReasons) {
    await ensureByField("CancellationReason", "labelLower", r.label.toLowerCase(), {
      label: r.label,
      labelLower: r.label.toLowerCase(),
      sortOrder: r.sortOrder,
      status: "active",
    });
  }

  await ensureByField("TaxRate", "nameLower", "vat 5%", {
    name: "VAT 5%",
    nameLower: "vat 5%",
    ratePercent: 5,
    status: "active",
  });
  await ensureByField("TaxRate", "nameLower", "gst 18%", {
    name: "GST 18%",
    nameLower: "gst 18%",
    ratePercent: 18,
    status: "active",
  });

  await ensureByField("Currency", "code", "USD", {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    isDefault: true,
    status: "active",
  });
  await ensureByField("Currency", "code", "PKR", {
    code: "PKR",
    symbol: "Rs",
    name: "Pakistani Rupee",
    isDefault: false,
    status: "active",
  });

  await ensureByField("BankAccount", "accountNumber", "****1234", {
    accountName: "Clinic Operating",
    bankName: "Demo Bank",
    accountNumber: "****1234",
    status: "active",
  });

  console.log("Seed complete.");
  console.log({
    specializations: Object.keys(specIds).length,
    accounts: created.length,
    doctors: doctorDocIds.length,
    linkedPatients: patientUids.length,
    walkIns: walkIns.length + 13,
    appointments: seededAppointments,
    prescriptions: seededPrescriptions,
    expenseCategories: categoryIds.length,
    invoices: invoiceDocIds.length,
    payments: paymentSeeds.length,
    expenses: expenseSeeds.length,
    departments: Object.keys(deptIds).length,
    designations: Object.keys(desigIds).length,
    leaveTypes: Object.keys(leaveTypeIds).length,
    staff: staffDocIds.length,
    holidays: holidaySeeds.length,
    leaves: leaveSeeds.length,
    clinicSettings: "main",
  });
  console.log(created);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
