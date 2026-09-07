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
        patientsName: "B",
        status: "pending",
      });
    });

    const asA = testEnv.authenticatedContext("patientA").firestore();
    await assertFails(getDoc(doc(asA, "Appointment", "appt1")));
  });
});
