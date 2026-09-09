import { describe, it, expect } from "vitest";
import { deriveInvoiceStatusFromPayments } from "../../src/core/utils/invoice.utils";
import {
  toMinor,
  fromMinor,
  addMinor,
  computeLineAmount,
  computeInvoiceTotals,
  computeBalance,
} from "../../src/core/utils/money.utils";

describe("money.utils", () => {
  it("rounds 0.1 + 0.2 correctly via minor units", () => {
    expect(toMinor(0.1) + toMinor(0.2)).toBe(30);
    expect(fromMinor(toMinor(0.1) + toMinor(0.2))).toBe(0.3);
  });

  it("toMinor / fromMinor round-trip common amounts", () => {
    expect(toMinor(12.34)).toBe(1234);
    expect(fromMinor(1234)).toBe(12.34);
    expect(toMinor(0.005)).toBe(1);
    expect(toMinor(NaN)).toBe(0);
  });

  it("computeLineAmount multiplies quantity × unit price in minor units", () => {
    expect(computeLineAmount(3, toMinor(10))).toBe(3000);
    expect(computeLineAmount(2.5, toMinor(4))).toBe(1000);
  });

  it("computeInvoiceTotals: subtotal → discount → tax → total", () => {
    // line 100.00 + 50.00 = 150.00; discount 10.00; tax 5% on 140 = 7.00; total 147.00
    const totals = computeInvoiceTotals({
      lineAmounts: [toMinor(100), toMinor(50)],
      taxRateBps: 500,
      discountMinor: toMinor(10),
    });
    expect(totals.subtotal).toBe(15000);
    expect(totals.discount).toBe(1000);
    expect(totals.taxAmount).toBe(700);
    expect(totals.total).toBe(14700);
  });

  it("balance = total - amountPaid (never negative)", () => {
    expect(computeBalance(14700, 0)).toBe(14700);
    expect(computeBalance(14700, 5000)).toBe(9700);
    expect(computeBalance(14700, 14700)).toBe(0);
    expect(computeBalance(14700, 20000)).toBe(0);
  });

  it("addMinor sums without float drift", () => {
    expect(addMinor(toMinor(0.1), toMinor(0.2), toMinor(0.3))).toBe(60);
  });
});

describe("invoice payment status transitions", () => {
  it("sent → partially-paid → paid", () => {
    const total = toMinor(100);
    expect(deriveInvoiceStatusFromPayments(total, 0, "sent")).toBe("sent");
    expect(deriveInvoiceStatusFromPayments(total, toMinor(40), "sent")).toBe(
      "partially-paid"
    );
    expect(deriveInvoiceStatusFromPayments(total, total, "partially-paid")).toBe(
      "paid"
    );
  });

  it("keeps cancelled even if amountPaid changes", () => {
    expect(deriveInvoiceStatusFromPayments(10000, 5000, "cancelled")).toBe(
      "cancelled"
    );
  });

  it("draft stays draft until a payment is recorded", () => {
    expect(deriveInvoiceStatusFromPayments(10000, 0, "draft")).toBe("draft");
    expect(deriveInvoiceStatusFromPayments(10000, 1000, "draft")).toBe(
      "partially-paid"
    );
  });
});
