/**
 * FileObject / FileFolder security rules.
 * Requires: firebase emulators:start --only firestore
 * Run: npx vitest run tests/firestore/fileObject.rules.test.ts
 */
import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

let testEnv: RulesTestEnvironment;

const baseFile = (ownerUid: string, sharedWith: string[] = []) => ({
  fileName: "report.pdf",
  fileNameLower: "report.pdf",
  publicId: "medical-health-system/abc123",
  secureUrl: "https://res.cloudinary.com/demo/raw/upload/abc123.pdf",
  resourceType: "raw",
  format: "pdf",
  contentType: "application/pdf",
  sizeBytes: 1024,
  width: null,
  height: null,
  ownerUid,
  ownerRole: "doctor",
  sharedWith,
  folderId: null,
  appointmentId: null,
  patientId: null,
  doctorId: null,
  description: null,
  status: "active",
});

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
  await testEnv?.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

describe("FileObject rules", () => {
  it("owner reads own file", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "FileObject", "f1"), baseFile("doc1"));
    });
    const db = testEnv.authenticatedContext("doc1").firestore();
    await assertSucceeds(getDoc(doc(db, "FileObject", "f1")));
  });

  it("shared recipient can read", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(
        doc(ctx.firestore(), "FileObject", "f1"),
        baseFile("doc1", ["patient1"])
      );
    });
    const db = testEnv.authenticatedContext("patient1").firestore();
    await assertSucceeds(getDoc(doc(db, "FileObject", "f1")));
  });

  it("unrelated user cannot read", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "FileObject", "f1"), baseFile("doc1"));
    });
    const db = testEnv.authenticatedContext("stranger").firestore();
    await assertFails(getDoc(doc(db, "FileObject", "f1")));
  });

  it("signed-out cannot read", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "FileObject", "f1"), baseFile("doc1"));
    });
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "FileObject", "f1")));
  });

  it("cannot create with someone else's ownerUid", async () => {
    const db = testEnv.authenticatedContext("doc1").firestore();
    await assertFails(
      setDoc(doc(db, "FileObject", "f2"), baseFile("other-user"))
    );
  });

  it("cannot create over size cap", async () => {
    const db = testEnv.authenticatedContext("doc1").firestore();
    await assertFails(
      setDoc(doc(db, "FileObject", "f2"), {
        ...baseFile("doc1"),
        sizeBytes: 11 * 1024 * 1024,
      })
    );
  });

  it("owner cannot change publicId", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "FileObject", "f1"), baseFile("doc1"));
    });
    const db = testEnv.authenticatedContext("doc1").firestore();
    await assertFails(
      updateDoc(doc(db, "FileObject", "f1"), {
        publicId: "hijacked/id",
      })
    );
  });

  it("owner cannot change ownerUid", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "FileObject", "f1"), baseFile("doc1"));
    });
    const db = testEnv.authenticatedContext("doc1").firestore();
    await assertFails(
      updateDoc(doc(db, "FileObject", "f1"), { ownerUid: "other" })
    );
  });

  it("hard delete is denied", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "FileObject", "f1"), baseFile("doc1"));
    });
    const db = testEnv.authenticatedContext("doc1").firestore();
    await assertFails(deleteDoc(doc(db, "FileObject", "f1")));
  });

  it("owner can soft-delete (status)", async () => {
    await testEnv.withSecurityRulesDisabled(async (ctx) => {
      await setDoc(doc(ctx.firestore(), "FileObject", "f1"), baseFile("doc1"));
    });
    const db = testEnv.authenticatedContext("doc1").firestore();
    await assertSucceeds(
      updateDoc(doc(db, "FileObject", "f1"), { status: "deleted" })
    );
  });
});
