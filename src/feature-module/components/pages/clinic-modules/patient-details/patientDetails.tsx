import { Link, Navigate, useNavigate, useParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import {
  all_routes,
  doctorMessagesPath,
  editPatientPath,
  videoCallPath,
} from "../../../../routes/all_routes";
import { usePatient } from "./hooks/usePatient";
import PatientAppointmentsHistory from "./PatientAppointmentsHistory";
import { formatDate, formatFullAddress } from "../../../../../core/utils/display.utils";
import { useAuth } from "../../../../../core/context/AuthContext";
import { listAppointments } from "../../../../../core/services/firestore/appointments.service";
import { startOrJoinCall } from "../../../../../core/services/firestore/call.service";
import type { FirestoreAppointment } from "../../../../../core/types/appointment.types";

function formatBloodGroup(value: string | null | undefined): string {
  if (!value) return "—";
  return value.replace("+", " +ve").replace("-", " -ve");
}

function formatGenderLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function VitalValue({
  value,
  unit,
}: {
  value: string | null | undefined;
  unit?: string | null;
}) {
  if (!value) {
    return (
      <p className="mb-0 d-inline-flex align-items-center text-truncate text-muted">
        <i className="ti ti-point-filled me-1 text-muted fs-18" />
        Not recorded
      </p>
    );
  }
  return (
    <p className="mb-0 d-inline-flex align-items-center text-truncate">
      <i className="ti ti-point-filled me-1 text-primary fs-18" />
      {value}
      {unit ? ` ${unit}` : ""}
    </p>
  );
}

const PatientDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { role, user, doctorUserId } = useAuth();
  const { patient, loading, error, notFound } = usePatient(id);
  const isDoctor = role === "doctor";
  const patientsBackPath = isDoctor
    ? all_routes.doctorsappointments
    : all_routes.patients;
  const patientsBackLabel = isDoctor ? "Appointments" : "Patients";
  const [sharedAppointments, setSharedAppointments] = useState<
    FirestoreAppointment[]
  >([]);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openingChat, setOpeningChat] = useState(false);
  const [openingVideo, setOpeningVideo] = useState(false);

  useEffect(() => {
    if (!isDoctor || !id || !doctorUserId) {
      setSharedAppointments([]);
      return;
    }
    let cancelled = false;
    void listAppointments({ doctorUserId, pageSize: 100 })
      .then((result) => {
        if (cancelled) return;
        setSharedAppointments(
          result.appointments.filter((a) => a.patientId === id)
        );
      })
      .catch(() => {
        if (!cancelled) setSharedAppointments([]);
      });
    return () => {
      cancelled = true;
    };
  }, [isDoctor, id, doctorUserId]);

  const latestSharedAppointment = useMemo(
    () => sharedAppointments[0] ?? null,
    [sharedAppointments]
  );
  const latestVideoAppointment = useMemo(
    () =>
      sharedAppointments.find(
        (a) => a.appointmentType === "video" || a.isVideoCall
      ) ?? null,
    [sharedAppointments]
  );
  const hasPatientLogin = !!patient?.userId;

  const handleOpenChat = () => {
    if (!latestSharedAppointment?._id) {
      setActionError(
        "No shared appointment with this patient yet. Book or open an appointment first."
      );
      return;
    }
    if (!hasPatientLogin) {
      setActionError(
        "This patient has no login — chat unavailable for walk-in patients."
      );
      return;
    }
    setActionError(null);
    setOpeningChat(true);
    navigate(doctorMessagesPath(latestSharedAppointment._id));
    setOpeningChat(false);
  };

  const handleOpenVideo = async () => {
    if (!user?.uid) return;
    if (!latestVideoAppointment?._id) {
      setActionError(
        "No video appointment with this patient. Join video from a video-type appointment."
      );
      return;
    }
    if (!hasPatientLogin) {
      setActionError(
        "This patient has no account — video call unavailable."
      );
      return;
    }
    setOpeningVideo(true);
    setActionError(null);
    try {
      const call = await startOrJoinCall(
        latestVideoAppointment._id,
        user.uid,
        "video"
      );
      navigate(videoCallPath(call._id));
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to start video call"
      );
    } finally {
      setOpeningVideo(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-3">Loading patient...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <Navigate to={all_routes.error404} replace />;
  }

  if (error || !patient) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger" role="alert">
            {error ?? "You do not have access to this patient record."}
          </div>
          <Link to={patientsBackPath}>Back to {patientsBackLabel.toLowerCase()}</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ========================
			Start Page Content
		========================= */}
      <div className="page-wrapper">
        {/* Start Content */}
        <div className="content">
          {/* page header start */}
          <div className="mb-4">
            <h6 className="fw-bold mb-0 d-flex align-items-center">
              <Link to={patientsBackPath} className="text-dark">
                <i className="ti ti-chevron-left me-1" />
                {patientsBackLabel}
              </Link>
            </h6>
          </div>
          {/* page header end */}
          {/* card start */}
          <div className="card">
            <div className="row align-items-end">
              <div className="col-xl-9 col-lg-8">
                <div className="d-sm-flex align-items-center position-relative z-0 overflow-hidden p-3">
                  <ImageWithBasePath
                    src="./assets/img/icons/shape-01.svg"
                    alt="img"
                    className="z-n1 position-absolute end-0 top-0 d-none d-lg-flex"
                  />
                  <Link
                    to="#"
                    className="avatar avatar-xxxl patient-avatar me-2 flex-shrink-0"
                  >
                    <ImageWithBasePath
                      src="assets/img/users/user-08.jpg"
                      alt="product"
                      className="rounded"
                    />
                  </Link>
                  <div>
                    <p className="text-primary mb-1">#{patient.patientId || patient._id}</p>
                    <h5 className="mb-1">
                      <Link to="#" className="fw-bold">
                        {patient.displayName}
                      </Link>
                    </h5>
                    <p className="mb-3">{formatFullAddress(patient.address)}</p>
                    <div className="d-flex align-items-center flex-wrap">
                      <p className="mb-0 d-inline-flex align-items-center">
                        <i className="ti ti-phone me-1 text-dark" />
                        Phone :
                        <span className="text-dark ms-1">{patient.phoneNumber ?? "—"}</span>
                      </p>
                      <span className="mx-2 text-light">|</span>
                      <p className="mb-0 d-inline-flex align-items-center">
                        <i className="ti ti-calendar-time me-1 text-dark" />
                        Last Visited :
                        <span className="text-dark ms-1">{formatDate(patient.lastVisit)}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-3 col-lg-4">
                <div className="p-3 text-lg-end">
                  {isDoctor ? (
                    <div className="mb-4">
                      <button
                        type="button"
                        className="btn btn-outline-white shadow-sm rounded-circle d-inline-flex align-items-center p-2 fs-14 me-2"
                        title="Voice calls are not available yet"
                        disabled
                        aria-label="Voice call unavailable"
                      >
                        <i className="ti ti-phone" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-white shadow-sm rounded-circle d-inline-flex align-items-center p-2 fs-14 me-2"
                        data-testid="patient-details-chat-cta"
                        title={
                          !hasPatientLogin
                            ? "Patient has no login — chat unavailable"
                            : !latestSharedAppointment
                              ? "No shared appointment to open chat"
                              : "Message patient"
                        }
                        disabled={
                          openingChat ||
                          !hasPatientLogin ||
                          !latestSharedAppointment
                        }
                        onClick={handleOpenChat}
                      >
                        <i className="ti ti-message-circle" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-white shadow-sm rounded-circle d-inline-flex align-items-center p-2 fs-14"
                        data-testid="patient-details-video-cta"
                        title={
                          !hasPatientLogin
                            ? "Patient has no account — video unavailable"
                            : !latestVideoAppointment
                              ? "No video appointment with this patient"
                              : "Join video call"
                        }
                        disabled={
                          openingVideo ||
                          !hasPatientLogin ||
                          !latestVideoAppointment
                        }
                        onClick={() => void handleOpenVideo()}
                      >
                        <i className="ti ti-video" />
                      </button>
                      {actionError ? (
                        <div
                          className="alert alert-warning text-start mt-3 mb-0 py-2 fs-13"
                          role="alert"
                        >
                          {actionError}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="mb-4">
                      <Link
                        to="#"
                        className="btn btn-outline-white shadow-sm rounded-circle d-inline-flex align-items-center p-2 fs-14 me-2"
                      >
                        <i className="ti ti-phone" />
                      </Link>
                      <Link
                        to="#"
                        className="btn btn-outline-white shadow-sm rounded-circle d-inline-flex align-items-center p-2 fs-14 me-2"
                      >
                        <i className="ti ti-message-circle" />
                      </Link>
                      <Link
                        to="#"
                        className="btn btn-outline-white shadow-sm rounded-circle d-inline-flex align-items-center p-2 fs-14"
                      >
                        <i className="ti ti-video" />
                      </Link>
                    </div>
                  )}
                  {!isDoctor ? (
                    <>
                      <Link
                        to={editPatientPath(patient._id)}
                        className="btn btn-outline-primary me-2"
                      >
                        Edit
                      </Link>
                      <Link
                        to={all_routes.newAppointment}
                        className="btn btn-primary"
                      >
                        <i className="ti ti-calendar-event me-1" />
                        Book Apppointment
                      </Link>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
          {/* card end */}
          {/* row start */}
          <div className="row">
            <div className="col-xl-5 d-flex">
              <div className="card shadow-sm flex-fill w-100">
                <div className="card-header">
                  <h5 className="fw-bold mb-0">
                    <i className="ti ti-user-star me-1" />
                    About
                  </h5>
                </div>
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-sm-5">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-circle bg-light text-dark flex-shrink-0 me-2">
                          <i className="ti ti-calendar-event fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1">DOB</h6>
                          <p className="mb-0">{formatDate(patient.dateOfBirth)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-7">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-circle bg-light text-dark flex-shrink-0 me-2">
                          <i className="ti ti-droplet fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1">Blood Group</h6>
                          <p className="mb-0">{formatBloodGroup(patient.bloodGroup)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-5">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-circle bg-light text-dark flex-shrink-0 me-2">
                          <i className="ti ti-gender-male fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1">Gender</h6>
                          <p className="mb-0">{formatGenderLabel(patient.gender)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-7">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-circle bg-light text-dark flex-shrink-0 me-2">
                          <i className="ti ti-mail fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1">Email</h6>
                          <p className="mb-0 text-break">{patient.email ?? "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-7 d-flex">
              <div className="card shadow-sm flex-fill w-100">
                <div className="card-header">
                  <h5 className="fw-bold mb-0">
                    <i className="ti ti-book me-1" />
                    Vital Signs
                  </h5>
                </div>
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-2 bg-light text-dark flex-shrink-0 me-2 border">
                          <i className="ti ti-droplet fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1 text-truncate">
                            Blood Pressure
                          </h6>
                          <VitalValue
                            value={patient.vitals?.bloodPressure}
                            unit={patient.vitals?.bloodPressure ? "mmHg" : null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-2 bg-light text-dark flex-shrink-0 me-2 border">
                          <i className="ti ti-heart-rate-monitor fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1 text-truncate">
                            Heart Rate
                          </h6>
                          <VitalValue
                            value={patient.vitals?.heartRate}
                            unit={patient.vitals?.heartRate ? "Bpm" : null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-2 bg-light text-dark flex-shrink-0 me-2 border">
                          <i className="ti ti-hexagons fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1">SPO2</h6>
                          <VitalValue
                            value={patient.vitals?.spo2}
                            unit={patient.vitals?.spo2 ? "%" : null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-2 bg-light text-dark flex-shrink-0 me-2 border">
                          <i className="ti ti-temperature fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1 text-truncate">
                            Temperature
                          </h6>
                          <VitalValue
                            value={patient.vitals?.temperature}
                            unit={
                              patient.vitals?.temperature
                                ? patient.vitals.temperatureUnit ?? "F"
                                : null
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-2 bg-light text-dark flex-shrink-0 me-2 border">
                          <i className="ti ti-activity fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1 text-truncate">
                            Respiratory Rate
                          </h6>
                          <VitalValue
                            value={patient.vitals?.respiratoryRate}
                            unit={patient.vitals?.respiratoryRate ? "rpm" : null}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="col-sm-4">
                      <div className="d-flex align-items-center mb-3">
                        <span className="avatar rounded-2 bg-light text-dark flex-shrink-0 me-2 border">
                          <i className="ti ti-weight fs-16" />
                        </span>
                        <div>
                          <h6 className="fs-13 fw-bold mb-1 text-truncate">
                            Weight
                          </h6>
                          <VitalValue
                            value={patient.vitals?.weight}
                            unit={
                              patient.vitals?.weight
                                ? patient.vitals.weightUnit ?? "kg"
                                : null
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* row end */}
          <PatientAppointmentsHistory
            patientId={patient._id}
            doctorScoped={isDoctor}
          />
        </div>
        {/* End Content */}
        {/* Footer Start */}
        <div className="footer text-center bg-white p-2 border-top">
          <p className="text-dark mb-0">
            2025 ©
            <Link to="#" className="link-primary">
              Doctoury
            </Link>
            , All Rights Reserved
          </p>
        </div>
        {/* Footer End */}
      </div>
      {/* ========================
			End Page Content
		========================= */}
    </>
  );
};

export default PatientDetails;
