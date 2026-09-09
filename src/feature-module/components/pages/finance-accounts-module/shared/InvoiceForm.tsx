import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router";
import {
  invoiceFormSchema,
  type InvoiceFormSchema,
} from "../../../../../core/schemas/invoice.schema";
import type { InvoiceFormValues } from "../../../../../core/types/invoice.types";
import { all_routes } from "../../../../routes/all_routes";
import { buildInvoiceMoneyFields } from "../../../../../core/services/firestore/invoice.service";
import { formatMoney } from "../../../../../core/utils/money.utils";

export type SelectOption = { value: string; label: string };

export interface InvoiceFormProps {
  defaultValues?: Partial<InvoiceFormSchema>;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  submitting: boolean;
  error?: string | null;
  patientOptions?: SelectOption[];
  doctorOptions?: SelectOption[];
  cancelTo?: string;
  submitLabel?: string;
}

const EMPTY_LINE = {
  description: "",
  quantity: 1,
  unitPrice: 0,
};

const EMPTY_VALUES: InvoiceFormSchema = {
  appointmentId: "",
  patientId: "",
  doctorId: "",
  issuedOn: dayjs().format("YYYY-MM-DD"),
  dueDate: "",
  lineItems: [{ ...EMPTY_LINE }],
  taxRatePercent: 0,
  discount: 0,
  notes: "",
  status: "sent",
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "draft", label: "Draft" },
  { value: "sent", label: "Sent / Unpaid" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="text-danger fs-13 mt-1">{message}</div>;
}

const InvoiceForm = ({
  defaultValues,
  onSubmit,
  submitting,
  error,
  patientOptions = [],
  doctorOptions = [],
  cancelTo = all_routes.invoices,
  submitLabel = "Create Invoice",
}: InvoiceFormProps) => {
  const mergedDefaults = useMemo(
    () => ({
      ...EMPTY_VALUES,
      ...defaultValues,
      lineItems:
        defaultValues?.lineItems && defaultValues.lineItems.length > 0
          ? defaultValues.lineItems
          : EMPTY_VALUES.lineItems,
    }),
    [defaultValues]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormSchema>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: mergedDefaults,
  });

  useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  const watched = useWatch({ control });
  const liveTotals = useMemo(() => {
    try {
      return buildInvoiceMoneyFields({
        lineItems: (watched.lineItems || []).map((item) => ({
          description: item?.description || "",
          quantity: Number(item?.quantity) || 0,
          unitPrice: Number(item?.unitPrice) || 0,
        })),
        taxRatePercent: Number(watched.taxRatePercent) || 0,
        discount: Number(watched.discount) || 0,
      });
    } catch {
      return null;
    }
  }, [watched.lineItems, watched.taxRatePercent, watched.discount]);

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : null}

      <div className="card">
        <div className="card-header">
          <h5 className="fw-bold m-0"> New Invoice </h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Patient <span className="text-danger">*</span>
              </label>
              <select className="form-select" {...register("patientId")}>
                <option value="">Select patient</option>
                {patientOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <FieldError message={errors.patientId?.message} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Doctor
              </label>
              <select className="form-select" {...register("doctorId")}>
                <option value="">Select doctor (optional)</option>
                {doctorOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Issued On <span className="text-danger">*</span>
              </label>
              <Controller
                name="issuedOn"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="form-control"
                    format="YYYY-MM-DD"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) =>
                      field.onChange(d ? d.format("YYYY-MM-DD") : "")
                    }
                    getPopupContainer={getModalContainer}
                  />
                )}
              />
              <FieldError message={errors.issuedOn?.message} />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Due Date
              </label>
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="form-control"
                    format="YYYY-MM-DD"
                    value={field.value ? dayjs(field.value) : null}
                    onChange={(d) =>
                      field.onChange(d ? d.format("YYYY-MM-DD") : "")
                    }
                    getPopupContainer={getModalContainer}
                  />
                )}
              />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Status
              </label>
              <select className="form-select" {...register("status")}>
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Appointment ID
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="Optional"
                {...register("appointmentId")}
              />
            </div>
          </div>

          <h6 className="fw-bold mb-3">Line Items</h6>
          {fields.map((field, index) => (
            <div className="row align-items-end mb-2" key={field.id}>
              <div className="col-md-5 mb-2">
                <label className="form-label mb-1 fs-13">Description</label>
                <input
                  type="text"
                  className="form-control"
                  {...register(`lineItems.${index}.description`)}
                />
                <FieldError
                  message={errors.lineItems?.[index]?.description?.message}
                />
              </div>
              <div className="col-md-2 mb-2">
                <label className="form-label mb-1 fs-13">Qty</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  className="form-control"
                  {...register(`lineItems.${index}.quantity`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="col-md-3 mb-2">
                <label className="form-label mb-1 fs-13">
                  Unit Price (major)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-control"
                  {...register(`lineItems.${index}.unitPrice`, {
                    valueAsNumber: true,
                  })}
                />
              </div>
              <div className="col-md-2 mb-2">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="btn btn-outline-primary btn-sm mb-3"
            onClick={() => append({ ...EMPTY_LINE })}
          >
            <i className="ti ti-plus me-1" />
            Add line
          </button>
          <FieldError message={errors.lineItems?.message} />

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Tax %
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                {...register("taxRatePercent", { valueAsNumber: true })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Discount (major)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="form-control"
                {...register("discount", { valueAsNumber: true })}
              />
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label mb-1 text-dark fs-14 fw-medium">
                Notes
              </label>
              <input type="text" className="form-control" {...register("notes")} />
            </div>
          </div>

          {liveTotals ? (
            <div className="border rounded p-3 mb-3 bg-light">
              <div className="d-flex justify-content-between mb-1">
                <span>Subtotal</span>
                <strong>{formatMoney(liveTotals.subtotal)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Tax</span>
                <strong>{formatMoney(liveTotals.taxAmount)}</strong>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span>Discount</span>
                <strong>{formatMoney(liveTotals.discount)}</strong>
              </div>
              <div className="d-flex justify-content-between">
                <span className="fw-bold">Total</span>
                <strong>{formatMoney(liveTotals.total)}</strong>
              </div>
            </div>
          ) : null}

          <div className="d-flex align-items-center justify-content-end gap-2">
            <Link to={cancelTo} className="btn btn-light">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default InvoiceForm;
