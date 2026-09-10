/**
 * Firestore Call rules tests.
 * Requires: firebase emulators:start --only firestore
 * Run: npx vitest run tests/firestore/call.rules.test.ts
 */
import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
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

async function seedAppointment() {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "Users", "doc1"), {
      uid: "doc1",
      role: "doctor",
      email: "d@example.com",
    });
    await setDoc(doc(db, "Users", "pat1"), {
      uid: "pat1",
      role: "patient",
      email: "p@example.com",
    });
    await setDoc(doc(db, "Patient", "pdoc1"), {
      userId: "pat1",
      displayName: "Pat",
    });
    await setDoc(doc(db, "Appointment", "appt1"), {
      doctorUserId: "doc1",
      UserPatientID: "pat1",
      patientId: "pdoc1",
      appointmentType: "video",
    });
  });
}

function ringingPayload(overrides: Record<string, unknown> = {}) {
  return {
    appointmentId: "appt1",
    doctorUserId: "doc1",
    patientUserId: "pat1",
    participantUids: ["doc1", "pat1"],
    callerUid: "doc1",
    calleeUid: "pat1",
    doctorName: "Doc",
    patientName: "Pat",
    callType: "video",
    status: "ringing",
    offer: null,
    answer: null,
    startedAt: null,
    endedAt: null,
    durationSeconds: null,
    endedBy: null,
    endReason: null,
    created: new Date(),
    createdBy: "doc1",
    updated: null,
    updatedBy: null,
    ...overrides,
  };
}

describe("Call rules", () => {
  it("participant can read own call; non-participant and signed-out cannot", async () => {
    await seedAppointment();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "Call", "c1"), ringingPayload());
    });

    const asDoc = testEnv.authenticatedContext("doc1").firestore();
    const asOther = testEnv.authenticatedContext("stranger").firestore();
    const unauth = testEnv.unauthenticatedContext().firestore();

    await assertSucceeds(getDoc(doc(asDoc, "Call", "c1")));
    await assertFails(getDoc(doc(asOther, "Call", "c1")));
    await assertFails(getDoc(doc(unauth, "Call", "c1")));
  });

  it("non-participant of the appointment cannot create a call", async () => {
    await seedAppointment();
    const asOther = testEnv.authenticatedContext("stranger").firestore();
    await assertFails(
      setDoc(doc(asOther, "Call", "c2"), ringingPayload({ callerUid: "stranger" }))
    );
  });

  it("creating with callerUid ≠ own uid fails", async () => {
    await seedAppointment();
    const asPat = testEnv.authenticatedContext("pat1").firestore();
    await assertFails(
      setDoc(doc(asPat, "Call", "c3"), ringingPayload({ callerUid: "doc1" }))
    );
  });

  it("creating with status connected fails", async () => {
    await seedAppointment();
    const asDoc = testEnv.authenticatedContext("doc1").firestore();
    await assertFails(
      setDoc(
        doc(asDoc, "Call", "c4"),
        ringingPayload({ status: "connected", callerUid: "doc1" })
      )
    );
  });

  it("participant cannot rewrite calleeUid", async () => {
    await seedAppointment();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "Call", "c5"), ringingPayload());
    });
    const asDoc = testEnv.authenticatedContext("doc1").firestore();
    await assertFails(
      updateDoc(doc(asDoc, "Call", "c5"), { calleeUid: "stranger" })
    );
  });

  it("anyone deleting a call fails", async () => {
    await seedAppointment();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "Call", "c6"), ringingPayload());
    });
    const asDoc = testEnv.authenticatedContext("doc1").firestore();
    await assertFails(deleteDoc(doc(asDoc, "Call", "c6")));
  });

  it("non-participant cannot write ICE candidates", async () => {
    await seedAppointment();
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "Call", "c7"), ringingPayload());
    });
    const asOther = testEnv.authenticatedContext("stranger").firestore();
    await assertFails(
      addDoc(collection(asOther, "Call", "c7", "callerCandidates"), {
        candidate: "x",
        sdpMid: "0",
        sdpMLineIndex: 0,
      })
    );
  });

  it("participant can create a ringing call and ICE candidate", async () => {
    await seedAppointment();
    const asDoc = testEnv.authenticatedContext("doc1").firestore();
    await assertSucceeds(
      setDoc(doc(asDoc, "Call", "c8"), ringingPayload({ callerUid: "doc1" }))
    );
    await assertSucceeds(
      addDoc(collection(asDoc, "Call", "c8", "callerCandidates"), {
        candidate: "cand",
        sdpMid: "0",
        sdpMLineIndex: 0,
      })
    );
  });
});
