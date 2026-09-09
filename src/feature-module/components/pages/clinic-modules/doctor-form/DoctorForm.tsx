import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import CommonSelect from "../../../../../core/common/common-select/commonSelect";
import { all_routes } from "../../../../routes/all_routes";
import {
  doctorCreateFormSchema,
  doctorEditFormSchema,
  type DoctorFormSchema,
} from "../../../../../core/schemas/doctor.schema";
import { listSpecializations } from "../../../../../core/services/firestore/specialization.service";
import type { DoctorProfileFormValues } from "../../../../../core/services/firestore/doctor.service";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="text-danger fs-13 mt-1">{message}</div>;
}

const EMPTY_VALUES: DoctorFormSchema = {
  displayName: "",
  email: "",
  phoneNumber: "",
  specializationId: "",
  qualifications: "",
  experienceYears: 0,
  consultationFee: 0,
  bio: "",
  status: "active",
  uid: "",
  password: "",
  confirmPassword: "",
};

export interface DoctorFormSubmitValues extends DoctorProfileFormValues {
  uid: string;
  password: string;
  confirmPassword: string;
}

export interface DoctorFormProps {
  defaultValues?: Partial<DoctorFormSchema>;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  /** When true, show password fields to create a login account. */
  createLogin?: boolean;
  onSubmit: (values: DoctorFormSubmitValues) => Promise<void>;
}

const DoctorForm = ({
  defaultValues,
  submitting,
  error,
  submitLabel,
  createLogin = false,
  onSubmit,
}: DoctorFormProps) => {
  const [specOptions, setSpecOptions] = useState<{ value: string; label: string }[]>([]);
  const [showAdvancedUid, setShowAdvancedUid] = useState(false);

  useEffect(() => {
    void listSpecializations(true)
      .then((rows) =>
        setSpecOptions(rows.map((s) => ({ value: s._id, label: s.name })))
      )
      .catch((err) => console.error("Failed to load specializations", err));
  }, []);

  const mergedDefaults = useMemo(
    () => ({ ...EMPTY_VALUES, ...defaultValues }),
    [defaultValues]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DoctorFormSchema>({
    resolver: zodResolver(createLogin ? doctorCreateFormSchema : doctorEditFormSchema),
    defaultValues: mergedDefaults,
    values: mergedDefaults,
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => {
        await onSubmit({
          displayName: values.displayName,
          email: values.email,
          phoneNumber: values.phoneNumber,
          specializationId: values.specializationId,
          qualifications: values.qualifications ?? "",
          experienceYears: Number(values.experienceYears) || 0,
          consultationFee: Number(values.consultationFee) || 0,
          bio: values.bio ?? "",
          status: values.status,
          uid: values.uid ?? "",
          password: values.password ?? "",
          confirmPassword: values.confirmPassword ?? "",
        });
      })}
    >
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="card">
        <div className="card-body">
          <h6 className="fw-bold mb-3">Doctor Information</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">
                  Full Name<span className="text-danger ms-1">*</span>
                </label>
                <input type="text" className="form-control" {...register("displayName")} />
                <FieldError message={errors.displayName?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">
                  Email<span className="text-danger ms-1">*</span>
                </label>
                <input type="email" className="form-control" {...register("email")} />
                <FieldError message={errors.email?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">
                  Phone Number<span className="text-danger ms-1">*</span>
                </label>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      defaultCountry="US"
                      value={field.value || undefined}
                      onChange={(value) => field.onChange(value ?? "")}
                    />
                  )}
                />
                <FieldError message={errors.phoneNumber?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">
                  Specialization<span className="text-danger ms-1">*</span>
                </label>
                <Controller
                  name="specializationId"
                  control={control}
                  render={({ field }) => (
                    <CommonSelect
                      options={specOptions}
                      className="select"
                      value={specOptions.find((o) => o.value === field.value)}
                      onChange={(option) => field.onChange(option?.value ?? "")}
                    />
                  )}
                />
                <FieldError message={errors.specializationId?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Qualifications</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="MBBS, MD"
                  {...register("qualifications")}
                />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Experience (years)</label>
                <input type="number" className="form-control" {...register("experienceYears", { valueAsNumber: true })} />
                <FieldError message={errors.experienceYears?.message} />
              </div>
            </div>
            <div className="col-md-3">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Consultation fee</label>
                <input type="number" className="form-control" {...register("consultationFee", { valueAsNumber: true })} />
                <FieldError message={errors.consultationFee?.message} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Status</label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <CommonSelect
                      options={STATUS_OPTIONS}
                      className="select"
                      value={STATUS_OPTIONS.find((o) => o.value === field.value)}
                      onChange={(option) => field.onChange(option?.value ?? "active")}
                    />
                  )}
                />
              </div>
            </div>
            <div className="col-md-12">
              <div className="mb-3">
                <label className="form-label mb-1 fw-medium">Bio</label>
                <textarea className="form-control" rows={3} {...register("bio")} />
              </div>
            </div>
          </div>

          {createLogin && (
            <>
              <h6 className="fw-bold mb-1 border-top pt-3">Login access</h6>
              <p className="text-muted fs-13 mb-3">
                Set a password so this doctor can sign in with the email above.
                Share the email and password securely after creating the account.
              </p>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label mb-1 fw-medium">
                      Password<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      autoComplete="new-password"
                      data-testid="doctor-password"
                      {...register("password")}
                    />
                    <FieldError message={errors.password?.message} />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label mb-1 fw-medium">
                      Confirm password<span className="text-danger ms-1">*</span>
                    </label>
                    <input
                      type="password"
                      className="form-control"
                      autoComplete="new-password"
                      data-testid="doctor-confirm-password"
                      {...register("confirmPassword")}
                    />
                    <FieldError message={errors.confirmPassword?.message} />
                  </div>
                </div>
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-link btn-sm px-0 mb-2"
                    onClick={() => setShowAdvancedUid((v) => !v)}
                  >
                    {showAdvancedUid
                      ? "Hide advanced UID option"
                      : "Already have an Auth UID? Link instead"}
                  </button>
                </div>
                {showAdvancedUid && (
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label mb-1 fw-medium">
                        Existing Firebase Auth UID
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Paste UID if the login already exists"
                        {...register("uid")}
                      />
                      <p className="text-muted fs-13 mb-0 mt-1">
                        If set, password fields are ignored and this existing
                        account is linked instead.
                      </p>
                      <FieldError message={errors.uid?.message} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end">
        <Link to={all_routes.doctorsList} className="btn btn-light me-2">
          Cancel
        </Link>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting && (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default DoctorForm;
