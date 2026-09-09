import { describe, it, expect } from "vitest";
import {
  toMinor,
  fromMinor,
  computeInvoiceTotals,
  computeBalance,
} from "../../src/core/utils/money.utils";

describe("money.utils", () => {
  describe("toMinor", () => {
    it("converts major units to integer minor units", () => {
      expect(toMinor(12.34)).toBe(1234);
      expect(toMinor(0.1)).toBe(10);
      expect(toMinor(1)).toBe(100);
    });

    it("returns 0 for non-finite input", () => {
      expect(toMinor(Number.NaN)).toBe(0);
      expect(toMinor(Number.POSITIVE_INFINITY)).toBe(0);
    });

    it("respects a custom scale", () => {
      expect(toMinor(1.5, 1000)).toBe(1500);
    });
  });

  describe("fromMinor", () => {
    it("converts minor units back to major units", () => {
      expect(fromMinor(1234)).toBe(12.34);
      expect(fromMinor(10)).toBe(0.1);
    });

    it("returns 0 for non-finite input", () => {
      expect(fromMinor(Number.NaN)).toBe(0);
    });
  });

  describe("computeInvoiceTotals", () => {
    it("computes subtotal, tax, discount, and total", () => {
      const result = computeInvoiceTotals({
        lineAmounts: [1000, 500],
        taxRateBps: 500,
        discountMinor: 200,
      });
      expect(result.subtotal).toBe(1500);
      expect(result.discount).toBe(200);
      expect(result.taxAmount).toBe(65); // 5% of 1300
      expect(result.total).toBe(1365);
    });

    it("handles zero tax and discount", () => {
      const result = computeInvoiceTotals({
        lineAmounts: [2500],
        taxRateBps: 0,
        discountMinor: 0,
      });
      expect(result).toEqual({
        subtotal: 2500,
        taxAmount: 0,
        discount: 0,
        total: 2500,
      });
    });
  });

  describe("computeBalance", () => {
    it("returns remaining balance after payment", () => {
      expect(computeBalance(1365, 365)).toBe(1000);
    });

    it("never goes negative", () => {
      expect(computeBalance(500, 800)).toBe(0);
    });
  });
});
