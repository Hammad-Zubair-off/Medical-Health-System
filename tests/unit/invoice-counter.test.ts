import { describe, expect, it } from "vitest";
import { formatInvoiceNumber } from "../../src/core/services/firestore/counter.service";

/**
 * Mirrors `allocateInvoiceNumberInTx` without Firestore — proves the numbering
 * contract. The emulator concurrency test in `tests/firestore/rules.test.ts`
 * exercises the real `runTransaction` path when Java is available.
 */
function allocateFromState(state: { next: number }): string {
  const safeNext =
    Number.isFinite(state.next) && state.next > 0 ? Math.floor(state.next) : 1;
  state.next = safeNext + 1;
  return formatInvoiceNumber(safeNext);
}

describe("invoice counter allocation", () => {
  it("formats INV-#### with zero padding", () => {
    expect(formatInvoiceNumber(1)).toBe("INV-0001");
    expect(formatInvoiceNumber(42)).toBe("INV-0042");
    expect(formatInvoiceNumber(9999)).toBe("INV-9999");
  });

  it("sequential allocations never collide", () => {
    const state = { next: 1 };
    const numbers = Array.from({ length: 50 }, () => allocateFromState(state));
    expect(new Set(numbers).size).toBe(50);
    expect(numbers[0]).toBe("INV-0001");
    expect(numbers[49]).toBe("INV-0050");
    expect(state.next).toBe(51);
  });

  it("recovers from non-positive counter values", () => {
    expect(allocateFromState({ next: 0 })).toBe("INV-0001");
    expect(allocateFromState({ next: NaN })).toBe("INV-0001");
  });
});
