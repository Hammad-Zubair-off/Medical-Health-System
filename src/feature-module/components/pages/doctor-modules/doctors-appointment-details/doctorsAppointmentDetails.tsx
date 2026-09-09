import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import ImageWithBasePath from "../../../../../core/imageWithBasePath";
import { all_routes } from "../../../../routes/all_routes";
import {
  getAppointmentById,
  updateAppointment,
} from "../../../../../core/services/firestore/appointments.service";
import type { FirestoreAppointment } from "../../../../../core/types/appointment.types";
import { toDate } from "../../../../../core/utils/firestore.utils";
import type { Timestamp } from "firebase/firestore";
import AppointmentAttachmentsPanel, {
  refToUid,
} from "../../clinic-modules/shared/AppointmentAttachmentsPanel";

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

const DoctorsAppointmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<FirestoreAppointment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    setError(null);
    try {
      await updateAppointment(id, {
        Complain: complain,
        diagnosis,
        description,
      });
    } catch (err) {
      console.error("Failed to save appointment", err);
      setError(
        err instanceof Error ? err.message : "Failed to save appointment"
      );
    } finally {
      setSaving(false);
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
                <Link to={all_routes.doctorsappointments} className="text-dark">
                  <i className="ti ti-chevron-left me-1" />
                  Appointments
                </Link>
              </h6>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h5 className="m-0 fw-bold">Appointment Details</h5>
            </div>
            <div className="card-body">
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="avatar avatar-xxl">
                  <ImageWithBasePath
                    src="assets/img/users/user-08.jpg"
                    alt="patient"
                    className="rounded-circle"
                  />
                </div>
                <div>
                  <span className="badge badge-soft-primary border border-primary mb-1">
                    #{appointment.AppointmentId || appointment._id}
                  </span>
                  <h5 className="fw-bold mb-1">
                    {appointment.patientsName || "Unknown Patient"}
                  </h5>
                  <p className="mb-0 text-muted fs-13">
                    {formatDateTime(
                      appointment.appointmentDate as Timestamp | Date
                    )}{" "}
                    ·{" "}
                    {appointment.appointmentType === "video" ||
                    appointment.isVideoCall
                      ? "Online"
                      : "In-Person"}{" "}
                    · {appointment.status}
                  </p>
                  <p className="mb-0 fs-13">
                    Phone: {appointment.patientsNumber || "—"}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label fw-medium">Complaint</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={complain}
                  onChange={(e) => setComplain(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Diagnosis</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-medium">Notes</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Link
                  to={all_routes.doctorsappointments}
                  className="btn btn-light"
                >
                  Back
                </Link>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={saving}
                  onClick={() => void handleSave()}
                >
                  {saving ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
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

export default DoctorsAppointmentDetails;
