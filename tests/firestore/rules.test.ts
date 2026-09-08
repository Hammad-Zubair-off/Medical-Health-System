/**
 * Firestore security rules unit tests.
 * Requires: firebase emulators:start --only firestore
 * Run: npx vitest run tests/firestore/rules.test.ts
 */
import { beforeAll, afterAll, beforeEach, describe, it, expect } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "medical-health-system-dev",
    firestore: {
      rules: readFileSync(resolve(__dirname, "../../firestore.rules"), "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("Firestore rules", () => {
  it("denies signed-out reads everywhere", async () => {
    const unauth = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(unauth, "Users", "anyone")));
    await assertFails(getDoc(doc(unauth, "Appointment", "a1")));
    await assertFails(getDoc(doc(unauth, "Doctor", "d1")));
    await assertFails(getDoc(doc(unauth, "Patient", "p1")));
  });

  it("patient cannot read another patient's Users doc", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "Users", "patientA"), {
        uid: "patientA",
        role: "patient",
        email: "a@example.com",
      });
      await setDoc(doc(db, "Users", "patientB"), {
        uid: "patientB",
        role: "patient",
        email: "b@example.com",
      });
    });

    const asA = testEnv.authenticatedContext("patientA").firestore();
    await assertSucceeds(getDoc(doc(asA, "Users", "patientA")));
    await assertFails(getDoc(doc(asA, "Users", "patientB")));
  });

  it("patient cannot self-promote to admin", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "Users", "patientA"), {
        uid: "patientA",
        role: "patient",
        email: "a@example.com",
      });
    });

    const asA = testEnv.authenticatedContext("patientA").firestore();
    await assertFails(
      updateDoc(doc(asA, "Users", "patientA"), { role: "admin" })
    );
  });

  it("patient cannot create Users doc as admin", async () => {
    const asA = testEnv.authenticatedContext("newUser").firestore();
    await assertFails(
      setDoc(doc(asA, "Users", "newUser"), {
        uid: "newUser",
        role: "admin",
        email: "x@example.com",
      })
    );
    await assertSucceeds(
      setDoc(doc(asA, "Users", "newUser"), {
        uid: "newUser",
        role: "patient",
        email: "x@example.com",
      })
    );
  });

  it("doctor can only update their own Doctor doc", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "Users", "doc1"), {
        uid: "doc1",
        role: "doctor",
        email: "d@example.com",
      });
      await setDoc(doc(db, "Users", "doc2"), {
        uid: "doc2",
        role: "doctor",
        email: "d2@example.com",
      });
      await setDoc(doc(db, "Doctor", "D1"), {
        userid: doc(db, "Users", "doc1"),
        specialization: "GP",
      });
      await setDoc(doc(db, "Doctor", "D2"), {
        userid: doc(db, "Users", "doc2"),
        specialization: "Cardio",
      });
    });

    const asDoc1 = testEnv.authenticatedContext("doc1").firestore();
    await assertSucceeds(
      updateDoc(doc(asDoc1, "Doctor", "D1"), { specialization: "GP2" })
    );
    await assertFails(
      updateDoc(doc(asDoc1, "Doctor", "D2"), { specialization: "Hacked" })
    );
  });

  it("patient cannot read another patient's appointment", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      await setDoc(doc(db, "Users", "patientA"), {
        uid: "patientA",
        role: "patient",
      });
      await setDoc(doc(db, "Users", "patientB"), {
        uid: "patientB",
        role: "patient",
      });
      await setDoc(doc(db, "Users", "doc1"), {
        uid: "doc1",
        role: "doctor",
      });
      await setDoc(doc(db, "Appointment", "appt1"), {
        doctorUserId: doc(db, "Users", "doc1"),
        UserPatientID: doc(db, "Users", "patientB"),
        patientId: "PB",
        patientsName: "B",
        status: "pending",
      });
    });

    const asA = testEnv.authenticatedContext("patientA").firestore();
    await assertFails(getDoc(doc(asA, "Appointment", "appt1")));
  });

  describe("Appointment collection (admin / walk-in / patient)", () => {
    async function seedAppointments() {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();
        await setDoc(doc(db, "Users", "admin1"), {
          uid: "admin1",
          role: "admin",
        });
        await setDoc(doc(db, "Users", "doc1"), {
          uid: "doc1",
          role: "doctor",
        });
        await setDoc(doc(db, "Users", "patientA"), {
          uid: "patientA",
          role: "patient",
        });
        await setDoc(doc(db, "Patient", "PA"), {
          userId: "patientA",
          displayName: "Patient A",
          status: "active",
        });
        await setDoc(doc(db, "Patient", "PWALK"), {
          userId: null,
          displayName: "Walk-in",
          status: "active",
        });
        await setDoc(doc(db, "Appointment", "linked"), {
          patientId: "PA",
          UserPatientID: doc(db, "Users", "patientA"),
          doctorUserId: doc(db, "Users", "doc1"),
          doctorId: "D1",
          status: "pending",
          patientsName: "Patient A",
        });
        await setDoc(doc(db, "Appointment", "walkin"), {
          patientId: "PWALK",
          UserPatientID: null,
          doctorUserId: doc(db, "Users", "doc1"),
          doctorId: "D1",
          status: "pending",
          patientsName: "Walk-in",
        });
      });
    }

    it("admin can read any appointment", async () => {
      await seedAppointments();
      const asAdmin = testEnv.authenticatedContext("admin1").firestore();
      await assertSucceeds(getDoc(doc(asAdmin, "Appointment", "linked")));
      await assertSucceeds(getDoc(doc(asAdmin, "Appointment", "walkin")));
    });

    it("doctor can read own appointment including walk-in", async () => {
      await seedAppointments();
      const asDoc = testEnv.authenticatedContext("doc1").firestore();
      await assertSucceeds(getDoc(doc(asDoc, "Appointment", "walkin")));
    });

    it("patient can read own linked appointment via patientId", async () => {
      await seedAppointments();
      const asA = testEnv.authenticatedContext("patientA").firestore();
      await assertSucceeds(getDoc(doc(asA, "Appointment", "linked")));
    });

    it("patient cannot cancel fields beyond status/cancel_reason", async () => {
      await seedAppointments();
      const asA = testEnv.authenticatedContext("patientA").firestore();
      await assertFails(
        updateDoc(doc(asA, "Appointment", "linked"), { diagnosis: "hacked" })
      );
      await assertSucceeds(
        updateDoc(doc(asA, "Appointment", "linked"), {
          status: "cancelled",
          cancel_reason: "personal",
          updated: new Date(),
          updatedBy: "patientA",
        })
      );
    });

    it("admin can create walk-in appointment with null UserPatientID", async () => {
      await seedAppointments();
      const asAdmin = testEnv.authenticatedContext("admin1").firestore();
      await assertSucceeds(
        setDoc(doc(asAdmin, "Appointment", "newwalk"), {
          patientId: "PWALK",
          UserPatientID: null,
          doctorUserId: doc(asAdmin, "Users", "doc1"),
          doctorId: "D1",
          status: "pending",
          patientsName: "Walk-in",
        })
      );
    });
  });

  describe("Patient collection (doctor↔patient join)", () => {
    async function seedClinic() {
      await testEnv.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();
        await setDoc(doc(db, "Users", "doc1"), {
          uid: "doc1",
          role: "doctor",
          email: "d@example.com",
        });
        await setDoc(doc(db, "Users", "patientA"), {
          uid: "patientA",
          role: "patient",
          email: "a@example.com",
        });
        await setDoc(doc(db, "Users", "patientB"), {
          uid: "patientB",
          role: "patient",
          email: "b@example.com",
        });
        await setDoc(doc(db, "Patient", "PA"), {
          userId: "patientA",
          displayName: "Patient A",
          status: "active",
        });
        await setDoc(doc(db, "Patient", "PB"), {
          userId: "patientB",
          displayName: "Patient B",
          status: "active",
        });
      });
    }

    it("doctor CAN read a Patient doc", async () => {
      await seedClinic();
      const asDoc = testEnv.authenticatedContext("doc1").firestore();
      await assertSucceeds(getDoc(doc(asDoc, "Patient", "PA")));
    });

    it("doctor CANNOT read an unrelated Users doc", async () => {
      await seedClinic();
      const asDoc = testEnv.authenticatedContext("doc1").firestore();
      await assertFails(getDoc(doc(asDoc, "Users", "patientA")));
    });

    it("patient CAN read their own Patient doc", async () => {
      await seedClinic();
      const asA = testEnv.authenticatedContext("patientA").firestore();
      await assertSucceeds(getDoc(doc(asA, "Patient", "PA")));
    });

    it("patient CANNOT read another patient's Patient doc", async () => {
      await seedClinic();
      const asA = testEnv.authenticatedContext("patientA").firestore();
      await assertFails(getDoc(doc(asA, "Patient", "PB")));
    });

    it("signed-out CANNOT read any Patient doc", async () => {
      await seedClinic();
      const unauth = testEnv.unauthenticatedContext().firestore();
      await assertFails(getDoc(doc(unauth, "Patient", "PA")));
    });

    it("linked patient cannot change their own status", async () => {
      await seedClinic();
      const asA = testEnv.authenticatedContext("patientA").firestore();
      await assertFails(updateDoc(doc(asA, "Patient", "PA"), { status: "inactive" }));
    });

    it("doctor can create a Patient doc", async () => {
      await seedClinic();
      const asDoc = testEnv.authenticatedContext("doc1").firestore();
      await assertSucceeds(
        setDoc(doc(asDoc, "Patient", "PNEW"), {
          userId: null,
          displayName: "Walk-in",
          status: "active",
        })
      );
    });
  });
});
