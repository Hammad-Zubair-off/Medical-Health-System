import { useEffect, useMemo, useState, type FormEvent } from "react";
import { DatePicker } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useAuth } from "../../../../../core/context/AuthContext";
import { createPayment } from "../../../../../core/services/firestore/payment.service";
import { listInvoices } from "../../../../../core/services/firestore/invoice.service";
import { getClinicSettings } from "../../../../../core/services/firestore/clinic-settings.service";
import type { PaymentMethod } from "../../../../../core/types/payment.types";
import { formatMoney } from "../../../../../core/utils/money.utils";

type InvoiceOption = {
  id: string;
  label: string;
  balance: number;
  patientName: string | null;
};

type PaymentsModalProps = {
  onCreated?: () => void | Promise<void>;
};

const ALL_METHOD_OPTIONS: { value: PaymentMethod; label: string; flag: string }[] = [
  { value: "cash", label: "Cash", flag: "cash" },
  { value: "card", label: "Card", flag: "card" },
  { value: "bank-transfer", label: "Bank Transfer", flag: "bankTransfer" },
  { value: "insurance", label: "Insurance", flag: "insurance" },
  { value: "other", label: "Other", flag: "other" },
];

const PaymentsModal = ({ onCreated }: PaymentsModalProps) => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<InvoiceOption[]>([]);
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [paidOn, setPaidOn] = useState<Dayjs | null>(dayjs());
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [enabledFlags, setEnabledFlags] = useState<Record<string, boolean> | null>(
    null
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [invResult, clinic] = await Promise.all([
          listInvoices({ pageSize: 50 }),
          getClinicSettings(),
        ]);
        if (cancelled) return;
        setEnabledFlags(clinic.paymentMethods as unknown as Record<string, boolean>);
        setInvoices(
          invResult.invoices
            .filter((inv) => inv.status !== "cancelled" && inv.balance > 0)
            .map((inv) => ({
              id: inv._id,
              label: `${inv.invoiceNumber || inv._id} — ${inv.patientName || "Patient"} (${formatMoney(inv.balance)} due)`,
              balance: inv.balance,
              patientName: inv.patientName,
            }))
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load invoices"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const methodOptions = useMemo(() => {
    if (!enabledFlags) return ALL_METHOD_OPTIONS;
    const filtered = ALL_METHOD_OPTIONS.filter((m) => enabledFlags[m.flag] !== false);
    return filtered.length > 0 ? filtered : ALL_METHOD_OPTIONS;
  }, [enabledFlags]);

  useEffect(() => {
    if (methodOptions.length && !methodOptions.some((m) => m.value === method)) {
      setMethod(methodOptions[0].value);
    }
  }, [methodOptions, method]);

  const selected = invoices.find((i) => i.id === invoiceId);

  const resetForm = () => {
    setInvoiceId("");
    setAmount("");
    setMethod("cash");
    setPaidOn(dayjs());
    setReference("");
    setNotes("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const major = Number(amount);
    if (!invoiceId) {
      setError("Select an invoice");
      return;
    }
    if (!Number.isFinite(major) || major <= 0) {
      setError("Enter a valid amount greater than zero");
      return;
    }
    if (!paidOn) {
      setError("Paid date is required");
      return;
    }

    setSubmitting(true);
    try {
      await createPayment(
        {
          invoiceId,
          amount: major,
          method,
          paidOn: paidOn.format("YYYY-MM-DD"),
          reference: reference.trim(),
          notes: notes.trim(),
        },
        user?.uid ?? null
      );
      setSuccess(
        `Payment recorded${selected?.patientName ? ` for ${selected.patientName}` : ""}`
      );
      resetForm();
      await onCreated?.();
      // Close Bootstrap modal if present
      const modalEl = document.getElementById("add_new_payment");
      const bootstrap = (
        window as unknown as {
          bootstrap?: {
            Modal?: { getInstance: (el: Element) => { hide: () => void } | null };
          };
        }
      ).bootstrap;
      if (modalEl && bootstrap?.Modal) {
        bootstrap.Modal.getInstance(modalEl)?.hide();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create payment");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal fade" id="add_new_payment" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <form onSubmit={handleSubmit} data-testid="add-payment-form">
              <div className="modal-header">
                <h5 className="modal-title text-dark fw-bold">New Payment</h5>
                <button
                  type="button"
                  className="btn-close btn-close-modal custom-btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                />
              </div>
              <div className="modal-body">
                {error ? (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                ) : null}
                {success ? (
                  <div className="alert alert-success" role="alert">
                    {success}
                  </div>
                ) : null}
                <div className="row">
                  <div className="col-lg-6 mb-3">
                    <label className="form-label" htmlFor="payment-invoice">
                      Invoice <span className="text-danger">*</span>
                    </label>
                    <select
                      id="payment-invoice"
                      className="form-select"
                      data-testid="payment-invoice"
                      value={invoiceId}
                      onChange={(e) => {
                        setInvoiceId(e.target.value);
                        const inv = invoices.find((i) => i.id === e.target.value);
                        if (inv) {
                          setAmount((inv.balance / 100).toFixed(2));
                        }
                      }}
                      required
                    >
                      <option value="">Select invoice</option>
                      {invoices.map((inv) => (
                        <option key={inv.id} value={inv.id}>
                          {inv.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="form-label" htmlFor="payment-paid-on">
                      Paid Date <span className="text-danger">*</span>
                    </label>
                    <DatePicker
                      id="payment-paid-on"
                      className="form-control w-100"
                      format="DD-MM-YYYY"
                      value={paidOn}
                      onChange={(d) => setPaidOn(d)}
                      data-testid="payment-paid-on"
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="form-label" htmlFor="payment-amount">
                      Amount <span className="text-danger">*</span>
                    </label>
                    <input
                      id="payment-amount"
                      type="number"
                      min="0.01"
                      step="0.01"
                      className="form-control"
                      data-testid="payment-amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="form-label" htmlFor="payment-method">
                      Method <span className="text-danger">*</span>
                    </label>
                    <select
                      id="payment-method"
                      className="form-select"
                      data-testid="payment-method"
                      value={method}
                      onChange={(e) =>
                        setMethod(e.target.value as PaymentMethod)
                      }
                    >
                      {methodOptions.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-lg-6 mb-3">
                    <label className="form-label" htmlFor="payment-reference">
                      Reference
                    </label>
                    <input
                      id="payment-reference"
                      type="text"
                      className="form-control"
                      data-testid="payment-reference"
                      value={reference}
                      onChange={(e) => setReference(e.target.value)}
                    />
                  </div>
                  <div className="col-lg-12 mb-3">
                    <label className="form-label" htmlFor="payment-notes">
                      Notes
                    </label>
                    <textarea
                      id="payment-notes"
                      className="form-control"
                      rows={3}
                      data-testid="payment-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-light btn-sm me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  data-testid="payment-submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Add New Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Keep IDs referenced by list action buttons */}
      <div className="modal fade" id="edit_new_payment" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Payment</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p className="mb-0 text-muted">
                Edit payment is not available yet. Cancel the payment and create
                a new one if the amount was wrong.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="delete_modal" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Cancel Payment</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <p className="mb-0 text-muted">
                Soft-cancel from the payment detail flow is coming next. Use
                admin tooling if you need to reverse a payment today.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentsModal;
