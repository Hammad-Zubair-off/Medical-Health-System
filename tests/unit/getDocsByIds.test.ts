import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock firebase/firestore's query building so we can assert chunking behaviour
// without needing a live Firestore connection.
const whereCalls: unknown[] = [];
const getDocsCalls: unknown[] = [];

vi.mock("firebase/firestore", async () => {
  const actual = await vi.importActual<typeof import("firebase/firestore")>(
    "firebase/firestore"
  );
  return {
    ...actual,
    collection: vi.fn((_db: unknown, path: string) => ({ path })),
    documentId: vi.fn(() => "__name__"),
    query: vi.fn((ref: unknown, ...clauses: unknown[]) => ({ ref, clauses })),
    where: vi.fn((field: string, op: string, value: unknown) => {
      const clause = { field, op, value };
      whereCalls.push(clause);
      return clause;
    }),
    getDocs: vi.fn(async (q: { clauses: Array<{ value: string[] }> }) => {
      getDocsCalls.push(q);
      const ids: string[] = q.clauses[0]?.value ?? [];
      return {
        docs: ids.map((id) => ({ id })),
      };
    }),
  };
});

vi.mock("../../src/firebase", () => ({
  db: {},
  auth: { currentUser: null },
}));

import { getDocsByIds } from "../../src/core/services/firestore/_helpers";
import { db } from "../../src/firebase";

beforeEach(() => {
  whereCalls.length = 0;
  getDocsCalls.length = 0;
});

describe("getDocsByIds", () => {
  it("returns an empty array for zero ids", async () => {
    const result = await getDocsByIds(db, "Patient", []);
    expect(result).toEqual([]);
    expect(getDocsCalls.length).toBe(0);
  });

  it("issues exactly one query for <= 10 ids", async () => {
    const ids = Array.from({ length: 10 }, (_, i) => `id-${i}`);
    const result = await getDocsByIds(db, "Patient", ids);
    expect(getDocsCalls.length).toBe(1);
    expect(result.map((d) => d.id).sort()).toEqual([...ids].sort());
  });

  it("chunks into two queries for 11 ids", async () => {
    const ids = Array.from({ length: 11 }, (_, i) => `id-${i}`);
    const result = await getDocsByIds(db, "Patient", ids);
    expect(getDocsCalls.length).toBe(2);
    expect(result.length).toBe(11);
  });

  it("de-duplicates ids before querying", async () => {
    const result = await getDocsByIds(db, "Patient", ["a", "a", "b"]);
    expect(getDocsCalls.length).toBe(1);
    expect(result.length).toBe(2);
  });

  it("filters out falsy ids", async () => {
    const result = await getDocsByIds(db, "Patient", ["a", "", "b"]);
    expect(result.map((d) => d.id).sort()).toEqual(["a", "b"]);
  });
});
