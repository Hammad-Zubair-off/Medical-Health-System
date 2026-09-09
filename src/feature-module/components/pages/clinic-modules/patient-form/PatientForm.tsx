import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link } from "react-router";
import { useEffect, useMemo, useState } from "react";
import CommonSelect from "../../../../../core/common/common-select/commonSelect";
import { Blood_Group } from "../../../../../core/common/selectOption";
import {
  GEO_CITIES,
  GEO_COUNTRIES,
  GEO_STATES,
} from "../../../../../core/constants/geo";
import { all_routes } from "../../../../routes/all_routes";
import {
  patientFormSchema,
  type PatientFormSchema,
} from "../../../../../core/schemas/patient.schema";
import type { PatientFormValues } from "../../../../../core/types/patient.types";
import { listDoctors } from "../../../../../core/services/firestore/doctor.service";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

const BLOOD_OPTIONS = Blood_Group.filter((o) => o.value !== "Select");
const COUNTRY_OPTIONS = GEO_COUNTRIES;
const STATE_OPTIONS = GEO_STATES;
const CITY_OPTIONS = GEO_CITIES;

const TEMP_UNIT_OPTIONS = [
  { value: "F", label: "°F" },
  { value: "C", label: "°C" },
];

const WEIGHT_UNIT_OPTIONS = [
  { value: "kg", label: "kg" },
  { value: "lb", label: "lb" },
];

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <div className="text-danger fs-13 mt-1">{message}</div>;
}

const EMPTY_VALUES: PatientFormSchema = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  primaryDoctorId: "",
  dateOfBirth: "",
  gender: "male",
  bloodGroup: "O+",
  status: "active",
  addressLine1: "",
  addressLine2: "",
  country: "USA",
  state: "California",
  city: "Los Angeles",
  postalCode: "",
  bloodPressure: "",
  heartRate: "",
  spo2: "",
  temperature: "",
  temperatureUnit: "F",
  respiratoryRate: "",
  weight: "",
  weightUnit: "kg",
  createLogin: false,
  password: "",
  confirmPassword: "",
};

export interface PatientFormProps {
  defaultValues?: Partial<PatientFormSchema>;
  submitting: boolean;
  error: string | null;
  submitLabel: string;
  /** Show optional Auth password fields (create patient only). */
  showLoginOption?: boolean;
  onSubmit: (values: PatientFormValues) => Promise<void>;
}

const PatientForm = ({
  defaultValues,
  submitting,
  error,
  submitLabel,
  showLoginOption = false,
  onSubmit,
}: PatientFormProps) => {
  const [doctorOptions, setDoctorOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    void listDoctors({ pageSize: 50, status: "active" }).then((result) => {
      setDoctorOptions(
        result.doctors.map((d) => ({
          value: d._id ?? "",
          label: d.displayName || d.email || "Doctor",
        })).filter((o) => o.value)
      );
    }).catch((err) => console.error("Failed to load doctors for patient form", err));
  }, []);

  const mergedDefaults = useMemo(
    () => ({ ...EMPTY_VALUES, ...defaultValues }),
    [defaultValues]
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PatientFormSchema>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: mergedDefaults,
    values: mergedDefaults,
  });

  const watchCreateLogin = watch("createLogin");

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  return (
    <form
      data-testid="patient-form"
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
          <div className="form">
            <h6 className="fw-bold mb-3">Patient Information</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    First Name<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    data-testid="patient-first-name"
                    {...register("firstName")}
                  />
                  <FieldError message={errors.firstName?.message} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Last Name<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    data-testid="patient-last-name"
                    {...register("lastName")}
                  />
                  <FieldError message={errors.lastName?.message} />
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
                    Email Address<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    data-testid="patient-email"
                    {...register("email")}
                  />
                  <FieldError message={errors.email?.message} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Primary Doctor<span className="text-danger ms-1">*</span>
                  </label>
                  <Controller
                    name="primaryDoctorId"
                    control={control}
                    render={({ field }) => (
                      <CommonSelect
                        options={doctorOptions}
                        className="select"
                        value={doctorOptions.find((o) => o.value === field.value)}
                        onChange={(option) => field.onChange(option?.value ?? "")}
                      />
                    )}
                  />
                  <FieldError message={errors.primaryDoctorId?.message} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    DOB<span className="text-danger ms-1">*</span>
                  </label>
                  <div className="input-icon-end position-relative">
                    <Controller
                      name="dateOfBirth"
                      control={control}
                      render={({ field }) => (
                        <DatePicker
                          className="form-control datetimepicker"
                          format={{ format: "DD-MM-YYYY", type: "mask" }}
                          getPopupContainer={getModalContainer}
                          placeholder="DD-MM-YYYY"
                          suffixIcon={null}
                          value={field.value ? dayjs(field.value) : null}
                          onChange={(date) =>
                            field.onChange(date ? date.format("YYYY-MM-DD") : "")
                          }
                        />
                      )}
                    />
                    <span className="input-icon-addon">
                      <i className="ti ti-calendar" />
                    </span>
                  </div>
                  <FieldError message={errors.dateOfBirth?.message} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Gender<span className="text-danger ms-1">*</span>
                  </label>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <CommonSelect
                        options={GENDER_OPTIONS}
                        className="select"
                        value={GENDER_OPTIONS.find((o) => o.value === field.value)}
                        onChange={(option) => field.onChange(option?.value ?? "male")}
                      />
                    )}
                  />
                  <FieldError message={errors.gender?.message} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Blood Group<span className="text-danger ms-1">*</span>
                  </label>
                  <Controller
                    name="bloodGroup"
                    control={control}
                    render={({ field }) => (
                      <CommonSelect
                        options={BLOOD_OPTIONS}
                        className="select"
                        value={BLOOD_OPTIONS.find((o) => o.value === field.value)}
                        onChange={(option) => field.onChange(option?.value ?? "")}
                      />
                    )}
                  />
                  <FieldError message={errors.bloodGroup?.message} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Status<span className="text-danger ms-1">*</span>
                  </label>
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
                  <FieldError message={errors.status?.message} />
                </div>
              </div>
            </div>
            <h6 className="fw-bold mb-3 border-top pt-3">Address Information</h6>
            <div className="row">
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Address 1<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    data-testid="patient-address"
                    {...register("addressLine1")}
                  />
                  <FieldError message={errors.addressLine1?.message} />
                </div>
              </div>
              <div className="col-md-6">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">Address 2</label>
                  <input type="text" className="form-control" {...register("addressLine2")} />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label mb-1">
                    Country<span className="text-danger ms-1">*</span>
                  </label>
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <CommonSelect
                        options={COUNTRY_OPTIONS}
                        className="select"
                        value={COUNTRY_OPTIONS.find((o) => o.value === field.value)}
                        onChange={(option) => field.onChange(option?.value ?? "")}
                      />
                    )}
                  />
                  <FieldError message={errors.country?.message} />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label mb-1">
                    State<span className="text-danger ms-1">*</span>
                  </label>
                  <Controller
                    name="state"
                    control={control}
                    render={({ field }) => (
                      <CommonSelect
                        options={STATE_OPTIONS}
                        className="select"
                        value={STATE_OPTIONS.find((o) => o.value === field.value)}
                        onChange={(option) => field.onChange(option?.value ?? "")}
                      />
                    )}
                  />
                  <FieldError message={errors.state?.message} />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label mb-1">
                    City<span className="text-danger ms-1">*</span>
                  </label>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <CommonSelect
                        options={CITY_OPTIONS}
                        className="select"
                        value={CITY_OPTIONS.find((o) => o.value === field.value)}
                        onChange={(option) => field.onChange(option?.value ?? "")}
                      />
                    )}
                  />
                  <FieldError message={errors.city?.message} />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label mb-1">
                    Pincode<span className="text-danger ms-1">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    data-testid="patient-postal"
                    {...register("postalCode")}
                  />
                  <FieldError message={errors.postalCode?.message} />
                </div>
              </div>
            </div>
            <h6 className="fw-bold mb-1 border-top pt-3">
              Vital Signs{" "}
              <span className="fw-normal text-muted fs-13">(optional)</span>
            </h6>
            <p className="text-muted fs-13 mb-3">
              Leave blank if vitals were not measured at registration. Nothing is
              assumed.
            </p>
            <div className="row">
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 120/80"
                    data-testid="patient-vitals-bp"
                    {...register("bloodPressure")}
                  />
                  <FieldError message={errors.bloodPressure?.message} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 72"
                    data-testid="patient-vitals-hr"
                    {...register("heartRate")}
                  />
                  <FieldError message={errors.heartRate?.message} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">SPO2 (%)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 98"
                    data-testid="patient-vitals-spo2"
                    {...register("spo2")}
                  />
                  <FieldError message={errors.spo2?.message} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">Temperature</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 98.6"
                      data-testid="patient-vitals-temp"
                      {...register("temperature")}
                    />
                    <Controller
                      name="temperatureUnit"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          style={{ maxWidth: 80 }}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(e.target.value as "C" | "F")
                          }
                        >
                          {TEMP_UNIT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <FieldError message={errors.temperature?.message} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">
                    Respiratory Rate (rpm)
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 16"
                    data-testid="patient-vitals-rr"
                    {...register("respiratoryRate")}
                  />
                  <FieldError message={errors.respiratoryRate?.message} />
                </div>
              </div>
              <div className="col-md-4">
                <div className="mb-3">
                  <label className="form-label mb-1 fw-medium">Weight</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. 70"
                      data-testid="patient-vitals-weight"
                      {...register("weight")}
                    />
                    <Controller
                      name="weightUnit"
                      control={control}
                      render={({ field }) => (
                        <select
                          className="form-select"
                          style={{ maxWidth: 80 }}
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(e.target.value as "kg" | "lb")
                          }
                        >
                          {WEIGHT_UNIT_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                  </div>
                  <FieldError message={errors.weight?.message} />
                </div>
              </div>
            </div>
            {showLoginOption && (
              <>
                <h6 className="fw-bold mb-1 border-top pt-3">Login access</h6>
                <p className="text-muted fs-13 mb-3">
                  Optionally create a portal login so this patient can sign in with
                  their email. Leave unchecked for walk-in patients without an
                  account.
                </p>
                <div className="row">
                  <div className="col-12">
                    <div className="form-check mb-3">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="patient-create-login"
                        data-testid="patient-create-login"
                        {...register("createLogin")}
                      />
                      <label className="form-check-label" htmlFor="patient-create-login">
                        Create login account for this patient
                      </label>
                    </div>
                  </div>
                  {watchCreateLogin && (
                    <>
                      <div className="col-md-6">
                        <div className="mb-3">
                          <label className="form-label mb-1 fw-medium">
                            Password<span className="text-danger ms-1">*</span>
                          </label>
                          <input
                            type="password"
                            className="form-control"
                            autoComplete="new-password"
                            data-testid="patient-password"
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
                            data-testid="patient-confirm-password"
                            {...register("confirmPassword")}
                          />
                          <FieldError message={errors.confirmPassword?.message} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="d-flex align-items-center justify-content-end">
        <Link to={all_routes.patients} className="btn btn-light me-2">
          Cancel
        </Link>
        <button
          type="submit"
          className="btn btn-primary"
          data-testid="patient-submit"
          disabled={submitting}
        >
          {submitting && (
            <span className="spinner-border spinner-border-sm me-2" role="status" />
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PatientForm;
