/** Integer minor-unit money helpers. Never store floats for currency. */

export type MinorUnits = number;

/** Convert a major-unit amount (e.g. 12.34) to integer minor units (1234). */
export function toMinor(major: number, scale = 100): MinorUnits {
  if (!Number.isFinite(major)) return 0;
  return Math.round(major * scale);
}

/** Convert integer minor units back to a major-unit number for display math. */
export function fromMinor(minor: MinorUnits, scale = 100): number {
  if (!Number.isFinite(minor)) return 0;
  return minor / scale;
}

export function formatMoney(
  minor: MinorUnits,
  currency = "USD",
  locale = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(fromMinor(minor));
}

export function addMinor(...parts: MinorUnits[]): MinorUnits {
  return parts.reduce((sum, n) => sum + (Number.isFinite(n) ? Math.round(n) : 0), 0);
}

export function computeLineAmount(quantity: number, unitPriceMinor: MinorUnits): MinorUnits {
  const qty = Number.isFinite(quantity) ? quantity : 0;
  return Math.round(qty * unitPriceMinor);
}

export function computeInvoiceTotals(input: {
  lineAmounts: MinorUnits[];
  taxRateBps: number; // basis points, e.g. 500 = 5%
  discountMinor: MinorUnits;
}): {
  subtotal: MinorUnits;
  taxAmount: MinorUnits;
  discount: MinorUnits;
  total: MinorUnits;
} {
  const subtotal = addMinor(...input.lineAmounts);
  const discount = Math.max(0, Math.round(input.discountMinor || 0));
  const taxable = Math.max(0, subtotal - discount);
  const taxAmount = Math.round((taxable * (input.taxRateBps || 0)) / 10000);
  const total = taxable + taxAmount;
  return { subtotal, taxAmount, discount, total };
}

export function computeBalance(total: MinorUnits, amountPaid: MinorUnits): MinorUnits {
  return Math.max(0, Math.round(total) - Math.round(amountPaid || 0));
}

/** Net pay = basic + allowances − deductions (all minor units). Never negative. */
export function computeNetPay(
  basicSalary: MinorUnits,
  allowances: MinorUnits[],
  deductions: MinorUnits[]
): MinorUnits {
  const gross = addMinor(Math.round(basicSalary || 0), ...allowances);
  const deducted = addMinor(...deductions);
  return Math.max(0, gross - deducted);
}
