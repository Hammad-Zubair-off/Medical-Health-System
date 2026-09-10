import { Link, useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import {
  all_routes,
  patientMessagesPath,
} from "../../../../routes/all_routes";
import { useAuth } from "../../../../../core/context/AuthContext";
import { getPatientByUserId } from "../../../../../core/services/firestore/patient.service";
import {
  cancelAppointment,
  getAppointmentById,
} from "../../../../../core/services/firestore/appointments.service";
import type { FirestoreAppointment } from "../../../../../core/types/appointment.types";
import { toDate } from "../../../../../core/utils/firestore.utils";
import type { Timestamp } from "firebase/firestore";
import AppointmentAttachmentsPanel, {
  refToUid,
} from "../../clinic-modules/shared/AppointmentAttachmentsPanel";
import StartVideoCallButton from "../../application-modules/application/calls/components/StartVideoCallButton";
import AppointmentRecentCalls from "../../application-modules/application/calls/components/AppointmentRecentCalls";

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

const PatientAppointmentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [appointment, setAppointment] = useState<FirestoreAppointment | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate(all_routes.error404, { replace: true });
      return;
    }
    if (!user?.uid) {
      setLoading(false);
      setError("Not signed in");
      return;
    }

    let cancelled = false;
    setLoading(true);
    setAccessDenied(false);

    void (async () => {
      try {
        const [patient, apt] = await Promise.all([
          getPatientByUserId(user.uid),
          getAppointmentById(id),
        ]);

        if (cancelled) return;

        if (!apt) {
          navigate(all_routes.error404, { replace: true });
          return;
        }

        if (!patient || apt.patientId !== patient._id) {
          setAccessDenied(true);
          setAppointment(null);
          setError(null);
          return;
        }

        setAppointment(apt);
        setError(null);
      } catch (err) {
        console.error("Failed to load appointment detail", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load appointment"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, user?.uid, navigate]);

  const handleCancel = async () => {
    if (!appointment?._id) return;
    setCancelling(true);
    try {
      await cancelAppointment(appointment._id);
      navigate(all_routes.patientappointments);
    } catch (err) {
      console.error("Failed to cancel appointment", err);
      setError(
        err instanceof Error ? err.message : "Failed to cancel appointment"
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenChat = () => {
    if (!id || !user?.uid) return;
    navigate(patientMessagesPath(id));
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

  if (accessDenied) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-warning" role="alert">
            Access denied. You can only view your own appointments.
          </div>
          <Link to={all_routes.patientappointments} className="btn btn-primary">
            Back to appointments
          </Link>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="page-wrapper">
        <div className="content">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          <Link to={all_routes.patientappointments} className="btn btn-primary">
            Back to appointments
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
            <div className="flex-grow-1">
              <h6 className="fw-semibold mb-0">
                <Link to={all_routes.patientappointments} className="text-dark">
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
              <h5 className="mb-0 fw-bold">
                Appointment #{appointment.AppointmentId || appointment._id}
              </h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <p className="mb-1 text-muted fs-13">Doctor</p>
                  <p className="fw-semibold">
                    {appointment.DoctorsName || "—"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 text-muted fs-13">Date &amp; Time</p>
                  <p className="fw-semibold">
                    {formatDateTime(
                      appointment.appointmentDate as Timestamp | Date
                    )}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 text-muted fs-13">Mode</p>
                  <p className="fw-semibold">
                    {appointment.appointmentType === "video" ||
                    appointment.isVideoCall
                      ? "Online"
                      : "In-Person"}
                  </p>
                </div>
                <div className="col-md-6">
                  <p className="mb-1 text-muted fs-13">Status</p>
                  <p className="fw-semibold text-capitalize">
                    {appointment.status}
                  </p>
                </div>
                <div className="col-12">
                  <p className="mb-1 text-muted fs-13">Reason</p>
                  <p className="fw-semibold">{appointment.Complain || "—"}</p>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-end">
                <Link
                  to={all_routes.patientappointments}
                  className="btn btn-light"
                >
                  Back
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-primary"
                  data-testid="appointment-message-cta"
                  disabled={!user?.uid}
                  onClick={handleOpenChat}
                >
                  <i className="ti ti-message me-1" />
                  Message
                </button>
                <StartVideoCallButton
                  appointmentId={id!}
                  isVideoAppointment={
                    appointment.appointmentType === "video" ||
                    !!appointment.isVideoCall
                  }
                  hasPatientLogin={true}
                />
                {appointment.status !== "cancelled" &&
                  appointment.status !== "completed" && (
                    <button
                      type="button"
                      className="btn btn-outline-danger"
                      disabled={cancelling}
                      onClick={() => void handleCancel()}
                    >
                      {cancelling ? "Cancelling…" : "Cancel appointment"}
                    </button>
                  )}
              </div>
            </div>
          </div>

          {id && (
            <>
              <AppointmentRecentCalls appointmentId={id} />
              <AppointmentAttachmentsPanel
                appointmentId={id}
                shareWithUid={refToUid(appointment.doctorUserId)}
                patientId={appointment.patientId ?? null}
                doctorId={refToUid(appointment.doctorId)}
              />
            </>
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

export default PatientAppointmentDetails;
