import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  toDate,
  toMillis,
  toTimestamp,
  toLowerSearchField,
} from "../../src/core/utils/firestore.utils";

describe("firestore.utils", () => {
  describe("toDate", () => {
    it("returns null for null/undefined", () => {
      expect(toDate(null)).toBeNull();
      expect(toDate(undefined)).toBeNull();
    });

    it("converts a Timestamp to a Date", () => {
      const ts = Timestamp.fromDate(new Date("2025-01-01T00:00:00.000Z"));
      expect(toDate(ts)?.toISOString()).toBe("2025-01-01T00:00:00.000Z");
    });

    it("passes a valid Date through", () => {
      const date = new Date("2025-01-01T00:00:00.000Z");
      expect(toDate(date)).toBe(date);
    });

    it("returns null for an invalid Date", () => {
      expect(toDate(new Date("not-a-date"))).toBeNull();
    });
  });

  describe("toMillis", () => {
    it("returns null for null/undefined", () => {
      expect(toMillis(null)).toBeNull();
    });

    it("returns epoch millis for a Timestamp", () => {
      const date = new Date("2025-06-15T12:00:00.000Z");
      const ts = Timestamp.fromDate(date);
      expect(toMillis(ts)).toBe(date.getTime());
    });
  });

  describe("toTimestamp", () => {
    it("returns null for null/undefined", () => {
      expect(toTimestamp(null)).toBeNull();
    });

    it("is a no-op for an existing Timestamp", () => {
      const ts = Timestamp.now();
      expect(toTimestamp(ts)).toBe(ts);
    });

    it("converts a valid Date to a Timestamp", () => {
      const date = new Date("2025-01-01T00:00:00.000Z");
      const ts = toTimestamp(date);
      expect(ts).toBeInstanceOf(Timestamp);
      expect(ts?.toDate().toISOString()).toBe("2025-01-01T00:00:00.000Z");
    });

    it("returns null for an invalid Date", () => {
      expect(toTimestamp(new Date("not-a-date"))).toBeNull();
    });
  });

  describe("toLowerSearchField", () => {
    it("lowercases and trims", () => {
      expect(toLowerSearchField("  Alberto RIPLEY  ")).toBe("alberto ripley");
    });

    it("returns empty string for null/undefined", () => {
      expect(toLowerSearchField(null)).toBe("");
      expect(toLowerSearchField(undefined)).toBe("");
    });
  });
});
