import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
import { all_routes, appointmentConsultationsPath } from "../../../../routes/all_routes";
import CommonSelect from "../../../../../core/common/common-select/commonSelect";
import {
  appointmentFormSchema,
  type AppointmentFormSchema,
} from "../../../../../core/schemas/appointment.schema";
import { createAppointment } from "../../../../../core/services/firestore/appointments.service";
import { listPatients } from "../../../../../core/services/firestore/patient.service";
import {
  listDoctors,
  type DoctorData,
} from "../../../../../core/services/firestore/doctor.service";
import type { DocumentReference } from "firebase/firestore";

const TYPE_OPTIONS = [
  { value: "physical", label: "In-Person" },
  { value: "video", label: "Video" },
];

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "checked-in", label: "Checked In" },
];

function doctorUserIdFromDoc(doctor: DoctorData): string | null {
  const raw = doctor.userid as DocumentReference | string | null | undefined;
  if (!raw) return null;
  if (typeof raw === "string") {
    const parts = raw.split("/");
    return parts[parts.length - 1] || raw;
  }
  if (typeof raw === "object" && "id" in raw) return raw.id;
  return null;
}

const NewAppointment = () => {
  const navigate = useNavigate();
  const [patientOptions, setPatientOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [doctors, setDoctors] = useState<DoctorData[]>([]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AppointmentFormSchema>({
    resolver: zodResolver(appointmentFormSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      doctorUserId: "",
      appointmentDate: "",
      appointmentTime: "",
      appointmentType: "physical",
      status: "pending",
      complain: "",
      description: "",
    },
  });

  const selectedDoctorId = watch("doctorId");

  useEffect(() => {
    void Promise.all([
      listPatients({ pageSize: 50, status: "active" }),
      listDoctors({ pageSize: 50, status: "active" }),
    ])
      .then(([patientsResult, doctorsResult]) => {
        setPatientOptions(
          patientsResult.patients
            .map((p) => ({
              value: p._id,
              label: p.displayName || p.email || "Patient",
            }))
            .filter((o) => o.value)
        );
        setDoctors(doctorsResult.doctors);
      })
      .catch((err) => {
        console.error("Failed to load patients/doctors", err);
        setSubmitError(
          err instanceof Error ? err.message : "Failed to load form options"
        );
      });
  }, []);

  const doctorOptions = useMemo(
    () =>
      doctors
        .map((d) => ({
          value: d._id ?? "",
          label: d.displayName || d.email || "Doctor",
        }))
        .filter((o) => o.value),
    [doctors]
  );

  useEffect(() => {
    if (!selectedDoctorId) {
      setValue("doctorUserId", "");
      return;
    }
    const doctor = doctors.find((d) => d._id === selectedDoctorId);
    const uid = doctor ? doctorUserIdFromDoc(doctor) : null;
    setValue("doctorUserId", uid ?? "", { shouldValidate: true });
  }, [selectedDoctorId, doctors, setValue]);

  const getModalContainer = () => {
    const modalElement = document.getElementById("modal-datepicker");
    return modalElement ? modalElement : document.body;
  };

  const onSubmit = async (values: AppointmentFormSchema) => {
    setSaving(true);
    setSubmitError(null);
    try {
      const doctor = doctors.find((d) => d._id === values.doctorId);
      const doctorUserId =
        values.doctorUserId ||
        (doctor ? doctorUserIdFromDoc(doctor) : null);
      if (!doctorUserId) {
        throw new Error(
          "Selected doctor has no linked user account (userid). Choose another doctor."
        );
      }

      const datePart = dayjs(values.appointmentDate);
      const timePart = dayjs(values.appointmentTime, ["HH:mm", "HH:mm:ss"]);
      const appointmentDate = datePart
        .hour(timePart.hour())
        .minute(timePart.minute())
        .second(0)
        .millisecond(0)
        .toDate();

      const newId = await createAppointment({
        patientId: values.patientId,
        doctorId: values.doctorId,
        doctorUserId,
        appointmentDate,
        appointmentTime: appointmentDate,
        appointmentType: values.appointmentType,
        status: values.status,
        DoctorsName: doctor?.displayName || "",
        Complain: values.complain || "",
        description: values.description || "",
        isVideoCall: values.appointmentType === "video",
      });

      navigate(appointmentConsultationsPath(newId));
    } catch (err) {
      console.error("Failed to create appointment", err);
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create appointment"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="mb-4">
                <h6 className="fw-bold mb-0 d-flex align-items-center">
                  <Link to={all_routes.appointments} className="text-dark">
                    <i className="ti ti-chevron-left me-1" />
                    Appointments
                  </Link>
                </h6>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {submitError && (
                  <div className="alert alert-danger" role="alert">
                    {submitError}
                  </div>
                )}

                <div className="card">
                  <div className="card-body">
                    <div className="form">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label mb-1 fw-medium">
                              Patient<span className="text-danger ms-1">*</span>
                            </label>
                            <Controller
                              name="patientId"
                              control={control}
                              render={({ field }) => (
                                <CommonSelect
                                  options={patientOptions}
                                  className="select"
                                  value={
                                    patientOptions.find(
                                      (o) => o.value === field.value
                                    ) || undefined
                                  }
                                  onChange={(opt) =>
                                    field.onChange(opt?.value ?? "")
                                  }
                                />
                              )}
                            />
                            {errors.patientId && (
                              <div className="text-danger fs-13 mt-1">
                                {errors.patientId.message}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label mb-1 fw-medium">
                              Doctor<span className="text-danger ms-1">*</span>
                            </label>
                            <Controller
                              name="doctorId"
                              control={control}
                              render={({ field }) => (
                                <CommonSelect
                                  options={doctorOptions}
                                  className="select"
                                  value={
                                    doctorOptions.find(
                                      (o) => o.value === field.value
                                    ) || undefined
                                  }
                                  onChange={(opt) =>
                                    field.onChange(opt?.value ?? "")
                                  }
                                />
                              )}
                            />
                            {errors.doctorId && (
                              <div className="text-danger fs-13 mt-1">
                                {errors.doctorId.message}
                              </div>
                            )}
                            {errors.doctorUserId && (
                              <div className="text-danger fs-13 mt-1">
                                {errors.doctorUserId.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label mb-1 fw-medium">
                              Appointment Type
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <Controller
                              name="appointmentType"
                              control={control}
                              render={({ field }) => (
                                <CommonSelect
                                  options={TYPE_OPTIONS}
                                  className="select"
                                  value={
                                    TYPE_OPTIONS.find(
                                      (o) => o.value === field.value
                                    ) || TYPE_OPTIONS[0]
                                  }
                                  onChange={(opt) =>
                                    field.onChange(
                                      (opt?.value as "physical" | "video") ??
                                        "physical"
                                    )
                                  }
                                />
                              )}
                            />
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
                                  value={
                                    STATUS_OPTIONS.find(
                                      (o) => o.value === field.value
                                    ) || STATUS_OPTIONS[0]
                                  }
                                  onChange={(opt) =>
                                    field.onChange(opt?.value ?? "pending")
                                  }
                                />
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label mb-1 fw-medium">
                              Date of Appointment
                              <span className="text-danger ms-1">*</span>
                            </label>
                            <div className="input-icon-end position-relative">
                              <Controller
                                name="appointmentDate"
                                control={control}
                                render={({ field }) => (
                                  <DatePicker
                                    className="form-control datetimepicker"
                                    format="DD-MM-YYYY"
                                    getPopupContainer={getModalContainer}
                                    placeholder="DD-MM-YYYY"
                                    suffixIcon={null}
                                    value={
                                      field.value
                                        ? dayjs(field.value)
                                        : null
                                    }
                                    onChange={(d) =>
                                      field.onChange(
                                        d ? d.format("YYYY-MM-DD") : ""
                                      )
                                    }
                                  />
                                )}
                              />
                              <span className="input-icon-addon">
                                <i className="ti ti-calendar" />
                              </span>
                            </div>
                            {errors.appointmentDate && (
                              <div className="text-danger fs-13 mt-1">
                                {errors.appointmentDate.message}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label mb-1 fw-medium">
                              Time<span className="text-danger ms-1">*</span>
                            </label>
                            <div className="input-icon-end position-relative">
                              <Controller
                                name="appointmentTime"
                                control={control}
                                render={({ field }) => (
                                  <TimePicker
                                    className="form-control"
                                    format="HH:mm"
                                    value={
                                      field.value
                                        ? dayjs(field.value, "HH:mm")
                                        : null
                                    }
                                    onChange={(t) =>
                                      field.onChange(
                                        t ? t.format("HH:mm") : ""
                                      )
                                    }
                                  />
                                )}
                              />
                              <span className="input-icon-addon">
                                <i className="ti ti-clock text-gray-7" />
                              </span>
                            </div>
                            {errors.appointmentTime && (
                              <div className="text-danger fs-13 mt-1">
                                {errors.appointmentTime.message}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label mb-1 fw-medium">
                          Appointment Reason
                        </label>
                        <Controller
                          name="complain"
                          control={control}
                          render={({ field }) => (
                            <textarea
                              className="form-control"
                              rows={3}
                              value={field.value ?? ""}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex align-items-center justify-content-end">
                  <Link
                    to={all_routes.appointments}
                    className="btn btn-light me-2"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving}
                  >
                    {saving && (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                    )}
                    Create Appointment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link to="#" className="link-primary">
              Doctoury
            </Link>
            , All Rights Reserved
          </p>
        </div>
      </div>
    </>
  );
};

export default NewAppointment;
