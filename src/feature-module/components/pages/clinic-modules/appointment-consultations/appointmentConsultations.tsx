import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import {
  adminMessagesPath,
  all_routes,
} from "../../../../routes/all_routes";
import { useAuth } from "../../../../../core/context/AuthContext";
import {
  getAppointmentById,
  updateAppointment,
} from "../../../../../core/services/firestore/appointments.service";
import AppointmentAttachmentsPanel, {
  refToUid,
} from "../shared/AppointmentAttachmentsPanel";
import { ensureThreadForAppointment } from "../../../../../core/services/firestore/chat.service";
import StartVideoCallButton from "../../application-modules/application/calls/components/StartVideoCallButton";
import type { FirestoreAppointment } from "../../../../../core/types/appointment.types";
import { toDate } from "../../../../../core/utils/firestore.utils";
import type { Timestamp } from "firebase/firestore";

function formatDateTime(value: Timestamp | Date | undefined): string {
  const date = toDate(value as Timestamp | Date | null | undefined);
  if (!date) return "—";
  return date.toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const AppointmentConsultations = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [appointment, setAppointment] = useState<FirestoreAppointment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [chatOpening, setChatOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complain, setComplain] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!id) {
      navigate(all_routes.error404, { replace: true });
      return;
    }
    let cancelled = false;
    setLoading(true);
    void getAppointmentById(id)
      .then((apt) => {
        if (cancelled) return;
        if (!apt) {
          navigate(all_routes.error404, { replace: true });
          return;
        }
        setAppointment(apt);
        setComplain(apt.Complain ?? "");
        setDiagnosis(apt.diagnosis ?? "");
        setDescription(apt.description ?? "");
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load appointment", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load appointment"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, navigate]);

  const handleSave = async (complete?: boolean) => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateAppointment(id, {
        Complain: complain,
        diagnosis,
        description,
        ...(complete ? { status: "completed" as const } : {}),
      });
      if (complete) {
        navigate(all_routes.appointments);
      }
    } catch (err) {
      console.error("Failed to save consultation", err);
      setError(
        err instanceof Error ? err.message : "Failed to save consultation"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleOpenChat = async () => {
    if (!id || !user?.uid) return;
    setChatOpening(true);
    setError(null);
    try {
      // Admin is read-only — only open existing threads. Doctors may ensure.
      if (role === "doctor") {
        await ensureThreadForAppointment(id, user.uid);
        navigate(`/doctor/messages/${id}`);
      } else {
        navigate(adminMessagesPath(id));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to open chat");
    } finally {
      setChatOpening(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return null;
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 mb-4">
            <div className="flex-grow-1">
              <h6 className="fs-14 fw-semibold mb-0 d-flex align-items-center">
                <Link to={all_routes.appointments} className="text-dark">
                  <i className="ti ti-chevron-left me-1" />
                  Appointments
                </Link>
              </h6>
            </div>
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              data-testid="appointment-message-cta"
              disabled={chatOpening || !user?.uid}
              onClick={() => void handleOpenChat()}
            >
              <i className="ti ti-message me-1" />
              {chatOpening ? "Opening…" : "Message"}
            </button>
            <StartVideoCallButton
              appointmentId={id!}
              className="btn btn-outline-success btn-sm"
              isVideoAppointment={
                appointment.appointmentType === "video" ||
                !!appointment.isVideoCall
              }
              hasPatientLogin={!!refToUid(appointment.UserPatientID)}
            />
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card rounded-0">
            <div className="card-header">
              <h5 className="m-0 fw-bold"> Basic Information </h5>
            </div>
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col-lg-6">
                  <div className="d-flex align-items-center gap-3">
                    <div className="avatar avatar-xxxl">
                      <ImageWithBasePath
                        src="assets/img/users/user-04.jpg"
                        alt="patient"
                        className="img-fluid img1 rounded"
                      />
                    </div>
                    <div>
                      <span className="badge badge-md text-info border border-info mb-1 fs-13 fw-medium px-2">
                        #{appointment.AppointmentId || appointment._id}
                      </span>
                      <h5 className="text-dark mb-1 fw-bold">
                        {appointment.patientsName || "Unknown Patient"}
                      </h5>
                      <p className="text-dark m-0">
                        <span className="text-body"> Doctor : </span>
                        {appointment.DoctorsName || "—"}
                      </p>
                      <p className="text-dark m-0">
                        <span className="text-body"> Reason : </span>
                        {appointment.Complain || "—"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="bg-light p-3 rounded d-flex align-items-center justify-content-between">
                    <div>
                      <div className="mb-2">
                        <h6 className="text-dark fs-14 fw-semibold mb-1">Date</h6>
                        <p className="text-body fs-13 m-0">
                          {formatDateTime(
                            appointment.appointmentDate as Timestamp | Date
                          )}
                        </p>
                      </div>
                      <div>
                        <h6 className="text-dark fs-14 fw-semibold mb-1">
                          Status
                        </h6>
                        <p className="text-body fs-13 m-0">
                          {appointment.status}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="mb-2">
                        <h6 className="text-dark fs-14 fw-semibold mb-1">
                          Phone
                        </h6>
                        <p className="text-body fs-13 m-0">
                          {appointment.patientsNumber || "—"}
                        </p>
                      </div>
                      <div>
                        <h6 className="text-dark fs-14 fw-semibold mb-1">
                          Consultation Type
                        </h6>
                        <p className="text-body fs-13 m-0">
                          {appointment.appointmentType === "video" ||
                          appointment.isVideoCall
                            ? "Online Consultation"
                            : "In-Person"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card rounded-0">
            <div className="card-header">
              <h5 className="m-0 fw-bold"> Complaint </h5>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={3}
                value={complain}
                onChange={(e) => setComplain(e.target.value)}
                placeholder="Patient complaint"
              />
            </div>
          </div>

          <div className="card rounded-0">
            <div className="card-header">
              <h5 className="m-0 fw-bold"> Diagnosis </h5>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={3}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="Diagnosis"
              />
            </div>
          </div>

          <div className="card rounded-0">
            <div className="card-header">
              <h5 className="m-0 fw-bold"> Notes / Description </h5>
            </div>
            <div className="card-body">
              <textarea
                className="form-control"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Clinical notes"
              />
            </div>
          </div>

          <div className="d-flex gap-2 align-items-center justify-content-end">
            <Link
              to={all_routes.appointments}
              className="btn btn-md bg-light text-dark fs-13 fw-medium rounded"
            >
              Cancel
            </Link>
            <button
              type="button"
              className="btn btn-md btn-outline-primary fs-13 fw-medium rounded"
              disabled={saving}
              onClick={() => void handleSave(false)}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              className="btn btn-md btn-primary fs-13 fw-medium rounded"
              disabled={saving}
              onClick={() => void handleSave(true)}
            >
              Complete Appointment
            </button>
          </div>

          {id && appointment && (
            <AppointmentAttachmentsPanel
              appointmentId={id}
              shareWithUid={refToUid(appointment.UserPatientID)}
              patientId={appointment.patientId ?? null}
              doctorId={refToUid(appointment.doctorId)}
            />
          )}
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

export default AppointmentConsultations;
