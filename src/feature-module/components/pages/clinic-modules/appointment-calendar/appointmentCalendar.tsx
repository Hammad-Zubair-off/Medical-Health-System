import { Link, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { all_routes, appointmentConsultationsPath } from "../../../../routes/all_routes";
import { listAppointments } from "../../../../../core/services/firestore/appointments.service";
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

function dateKey(value: Timestamp | Date | undefined): string {
  const date = toDate(value as Timestamp | Date | null | undefined);
  if (!date) return "Unknown";
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const AppointmentCalendar = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<FirestoreAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void listAppointments({ pageSize: 50 })
      .then((result) => {
        if (!cancelled) {
          setAppointments(result.appointments);
          setError(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load calendar appointments", err);
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load appointments"
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, FirestoreAppointment[]>();
    const sorted = [...appointments].sort((a, b) => {
      const da = toDate(a.appointmentDate as Timestamp | Date)?.getTime() ?? 0;
      const db = toDate(b.appointmentDate as Timestamp | Date)?.getTime() ?? 0;
      return da - db;
    });
    for (const apt of sorted) {
      const key = dateKey(apt.appointmentDate as Timestamp | Date);
      const list = map.get(key) ?? [];
      list.push(apt);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [appointments]);

  return (
    <>
      <div className="page-wrapper">
        <div className="content">
          <div className="d-flex align-items-sm-center flex-sm-row flex-column gap-2 pb-3 mb-3 border-1 border-bottom">
            <div className="flex-grow-1">
              <h4 className="fw-semibold mb-0"> Appointment </h4>
            </div>
            <div className="text-end d-flex">
              <div className="bg-white border rounded px-1 pb-0 text-center d-flex align-items-center shadow-sm justify-content-center">
                <Link
                  to={all_routes.appointments}
                  className="bg-white rounded p-1 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-list fs-14 text-body" />
                </Link>
                <Link
                  to={all_routes.appointmentCalendar}
                  className="bg-light rounded p-1 d-flex align-items-center justify-content-center"
                >
                  <i className="ti ti-calendar-event fs-14 text-body" />
                </Link>
              </div>
              <Link
                to={all_routes.newAppointment}
                className="btn btn-primary ms-2 fs-13 btn-md"
              >
                <i className="ti ti-plus me-1" /> New Appointment
              </Link>
            </div>
          </div>

          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="card mb-0">
              <div className="card-body">
                <h5 className="fw-bold mb-3">Upcoming appointments</h5>
                {grouped.length === 0 ? (
                  <p className="text-muted mb-0">No appointments found.</p>
                ) : (
                  grouped.map(([day, items]) => (
                    <div key={day} className="mb-4">
                      <h6 className="fw-semibold text-dark mb-2">{day}</h6>
                      <div className="list-group">
                        {items.map((apt) => (
                          <button
                            key={apt._id}
                            type="button"
                            className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                            onClick={() => {
                              if (apt._id) {
                                navigate(appointmentConsultationsPath(apt._id));
                              }
                            }}
                          >
                            <div className="text-start">
                              <div className="fw-semibold">
                                {apt.patientsName || "Unknown Patient"}
                              </div>
                              <div className="fs-13 text-muted">
                                {apt.DoctorsName || "Doctor"} ·{" "}
                                {apt.appointmentType === "video"
                                  ? "Video"
                                  : "In-Person"}{" "}
                                · {apt.status}
                              </div>
                            </div>
                            <span className="fs-13 text-dark">
                              {formatDateTime(
                                apt.appointmentDate as Timestamp | Date
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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

export default AppointmentCalendar;
