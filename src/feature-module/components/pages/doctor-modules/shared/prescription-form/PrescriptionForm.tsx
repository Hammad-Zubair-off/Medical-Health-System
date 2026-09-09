import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { Link } from "react-router";
import {
  prescriptionFormSchema,
  type PrescriptionFormSchema,
} from "../../../../../../core/schemas/prescription.schema";
import type { PrescriptionFormValues } from "../../../../../../core/types/prescription.types";
import { all_routes } from "../../../../../routes/all_routes";

export type SelectOption = { value: string; label: string };

export interface PrescriptionFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<PrescriptionFormSchema>;
  onSubmit: (values: PrescriptionFormValues) => Promise<void>;
  submitting: boolean;
  error?: string | null;
  patientOptions?: SelectOption[];
  appointmentOptions?: SelectOption[];
  cancelTo?: string;
}

const EMPTY_MEDICINE = {
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
};

const EMPTY_VALUES: PrescriptionFormSchema = {
  appointmentId: "",
  patientId: "",
  diagnosis: "",
  notes: "",
  followUpDate: "",
  medicines: [{ ...EMPTY_MEDICINE }],
  status: "active",
};

const STATUS_OPTIONS: SelectOption[] = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="text-danger fs-13 mt-1">{message}</div>;
}

const PrescriptionForm = ({
  mode,
  defaultValues,
  onSubmit,
  submitting,
  error,
  patientOptions = [],
  appointmentOptions = [],
  cancelTo = all_routes.doctorsprescriptions,
}: PrescriptionFormProps) => {
  const mergedDefaults = useMemo(
    () => ({
      ...EMPTY_VALUES,
      ...defaultValues,
      medicines:
        defaultValues?.medicines && defaultValues.medicines.length > 0
          ? defaultValues.medicines
          : EMPTY_VALUES.medicines,
    }),
    [defaultValues]
  );

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<PrescriptionFormSchema>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: mergedDefaults,
  });

  useEffect(() => {
    reset(mergedDefaults);
  }, [mergedDefaults, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "medicines",
  });

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
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      <div className="card">
        <div className="card-body pb-0">
          <h6 className="fw-bold mb-3">Prescription Details</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">
                  Patient<span className="text-danger ms-1">*</span>
                </label>
                <select
                  className="form-select"
                  disabled={mode === "edit"}
                  {...register("patientId")}
                >
                  <option value="">Select patient</option>
                  {patientOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.patientId?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Appointment</label>
                <select
                  className="form-select"
                  disabled={mode === "edit"}
                  {...register("appointmentId")}
                >
                  <option value="">None</option>
                  {appointmentOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.appointmentId?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Diagnosis</label>
                <input type="text" className="form-control" {...register("diagnosis")} />
                <FieldError message={errors.diagnosis?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Follow-up Date</label>
                <Controller
                  name="followUpDate"
                  control={control}
                  render={({ field }) => (
                    <div className="input-icon-end position-relative" id="modal-datepicker">
                      <DatePicker
                        className="form-control datetimepicker"
                        format={{ format: "YYYY-MM-DD", type: "mask" }}
                        getPopupContainer={getModalContainer}
                        placeholder="YYYY-MM-DD"
                        value={field.value ? dayjs(field.value) : null}
                        onChange={(date) =>
                          field.onChange(date ? date.format("YYYY-MM-DD") : "")
                        }
                        suffixIcon={null}
                      />
                      <span className="input-icon-addon">
                        <i className="ti ti-calendar" />
                      </span>
                    </div>
                  )}
                />
                <FieldError message={errors.followUpDate?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Status</label>
                <select className="form-select" {...register("status")}>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.status?.message} />
              </div>
            </div>
            <div className="col-12">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Notes</label>
                <textarea className="form-control" rows={3} {...register("notes")} />
                <FieldError message={errors.notes?.message} />
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between border-top pt-3 mb-3">
            <h6 className="fw-bold mb-0">Medicines</h6>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => append({ ...EMPTY_MEDICINE })}
            >
              <i className="ti ti-plus me-1" />
              Add Medicine
            </button>
          </div>
          {errors.medicines?.root?.message && (
            <FieldError message={errors.medicines.root.message} />
          )}
          {typeof errors.medicines?.message === "string" && (
            <FieldError message={errors.medicines.message} />
          )}

          {fields.map((field, index) => (
            <div key={field.id} className="border rounded p-3 mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="fs-14 fw-semibold mb-0">Medicine {index + 1}</h6>
                {fields.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => remove(index)}
                  >
                    <i className="ti ti-trash" />
                  </button>
                )}
              </div>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label mb-1 fw-medium">
                      Name<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      {...register(`medicines.${index}.name`)}
                    />
                    <FieldError message={errors.medicines?.[index]?.name?.message} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label mb-1 fw-medium">
                      Dosage<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      {...register(`medicines.${index}.dosage`)}
                    />
                    <FieldError message={errors.medicines?.[index]?.dosage?.message} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label mb-1 fw-medium">
                      Frequency<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 1-0-1"
                      {...register(`medicines.${index}.frequency`)}
                    />
                    <FieldError message={errors.medicines?.[index]?.frequency?.message} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label mb-1 fw-medium">
                      Duration<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 7 days"
                      {...register(`medicines.${index}.duration`)}
                    />
                    <FieldError message={errors.medicines?.[index]?.duration?.message} />
                  </div>
                </div>
                <div className="col-12">
                  <div className="mb-0">
                    <label className="form-label mb-1 fw-medium">Instructions</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. After meal"
                      {...register(`medicines.${index}.instructions`)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="d-flex align-items-center justify-content-end">
        <Link to={cancelTo} className="btn btn-light me-2">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          )}
          {mode === "create" ? "Create Prescription" : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default PrescriptionForm;
